import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";


const dbConfig = new pulumi.Config("db");
const dbUser = dbConfig.require("username");
const dbPassword = dbConfig.requireSecret("password");
const dbName = dbConfig.require("name");

const openaiConfig = new pulumi.Config("openai");
const openaiApiKey = openaiConfig.requireSecret("token");

const infra = new pulumi.StackReference("sprint-sync-infra/production");
const kubeconfig = infra.getOutput("kubeconfig");
const staticIp = infra.getOutput("staticIp");

const k8sProvider = new k8s.Provider("do-k8s", {
    kubeconfig: kubeconfig,
});

const appNamespace = new k8s.core.v1.Namespace("app-ns", {
    metadata: {name: "app"},
}, {provider: k8sProvider});

const dbSecret = new k8s.core.v1.Secret("pg-secret", {
    metadata: {namespace: appNamespace.metadata.name},
    stringData: {
        POSTGRES_USER: dbUser,
        POSTGRES_PASSWORD: dbPassword,
        POSTGRES_DB: dbName,
    },
}, {provider: k8sProvider});

const openaiSecret = new k8s.core.v1.Secret("openai-secret", {
    metadata: {namespace: appNamespace.metadata.name},
    stringData: {
        OPENAI_API_KEY: openaiApiKey,
    },
}, {
    provider: k8sProvider,
});

const pgPVC = new k8s.core.v1.PersistentVolumeClaim("pg-pvc", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        accessModes: ["ReadWriteOnce"],
        resources: {requests: {storage: "5Gi"}},
    },
}, {provider: k8sProvider});

const pgDeployment = new k8s.apps.v1.Deployment("postgres", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        selector: {matchLabels: {app: "postgres"}},
        replicas: 1,
        template: {
            metadata: {labels: {app: "postgres"}},
            spec: {
                containers: [
                    {
                        name: "postgres",
                        image: "postgres:17.5",
                        ports: [{containerPort: 5432}],
                        envFrom: [{secretRef: {name: dbSecret.metadata.name}}],
                        volumeMounts: [
                            {
                                name: "pgdata",
                                mountPath: "/var/lib/postgresql/data",
                            },
                        ],
                        readinessProbe: {
                            exec: { command: ["sh", "-c", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""] },
                            initialDelaySeconds: 5,
                            periodSeconds: 10,
                            failureThreshold: 6,
                        }
                    },
                ],
                volumes: [
                    {
                        name: "pgdata",
                        persistentVolumeClaim: {
                            claimName: pgPVC.metadata.name,
                        },
                    },
                ],
            },
        },
    },
}, {provider: k8sProvider});

const pgService = new k8s.core.v1.Service("postgres-svc", {
    metadata: {
        name: pgDeployment.metadata.name,
        namespace: appNamespace.metadata.name,

    },
    spec: {
        selector: {app: pgDeployment.metadata.name},
        ports: [{port: 5432}],
    },
}, {provider: k8sProvider});

const backendDeployment = new k8s.apps.v1.Deployment("backend", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        selector: {matchLabels: {app: "backend"}},
        replicas: 1,
        template: {
            metadata: {labels: {app: "backend"}},
            spec: {
                containers: [
                    {
                        name: "backend",
                        image: `ghcr.io/a-h-i/sprint-sync:latest`,
                        args: ["backend"],
                        ports: [{containerPort: 3000}],
                        readinessProbe: {
                            tcpSocket: {port: 3000},
                            initialDelaySeconds: 5,
                            periodSeconds: 10,
                            failureThreshold: 6,
                        },
                        env: [
                            {
                                name: "PG_USER",
                                valueFrom: {secretKeyRef: {name: dbSecret.metadata.name, key: "POSTGRES_USER"}}
                            },
                            {
                                name: "PG_PASSWORD",
                                valueFrom: {secretKeyRef: {name: dbSecret.metadata.name, key: "POSTGRES_PASSWORD"}}
                            },
                            {
                                name: "PG_DB",
                                valueFrom: {secretKeyRef: {name: dbSecret.metadata.name, key: "POSTGRES_DB"}}
                            },
                            {
                                name: "PG_MASTER_HOST",
                                value: `${pgService.metadata.name}.${pgService.metadata.namespace}.svc.cluster.local`
                            },
                            {name: "PG_MASTER_PORT", value: "5432"},
                        ],
                    },
                ],
            },
        },
    },
}, {provider: k8sProvider});

const backendService = new k8s.core.v1.Service("backend-svc", {
    metadata: {
        name: backendDeployment.metadata.name,
        namespace: appNamespace.metadata.name,
    },
    spec: {
        selector: {app: backendDeployment.metadata.name},
        ports: [{port: 3000}],
    },
});

const aiDeployment = new k8s.apps.v1.Deployment("ai", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        selector: {matchLabels: {app: "ai"}},
        replicas: 1,
        template: {
            metadata: {labels: {app: "ai"}},
            spec: {
                containers: [
                    {
                        name: "ai",
                        image: `ghcr.io/a-h-i/sprint-sync:latest`,
                        args: ["ai"],
                        ports: [{containerPort: 8000}],
                        readinessProbe: {
                            tcpSocket: {port: 8000},
                            initialDelaySeconds: 5,
                            periodSeconds: 10,
                            failureThreshold: 6,
                        },
                        env: [
                            {
                                name: "OPENAI_API_KEY",
                                valueFrom: {secretKeyRef: {name: openaiSecret.metadata.name, key: "OPENAI_API_KEY"}}
                            },
                        ]
                    }
                ]
            }
        }
    }
});
const aiService = new k8s.core.v1.Service("ai-svc", {
    metadata: {
        name: aiDeployment.metadata.name,
        namespace: appNamespace.metadata.name,
    },
    spec: {
        selector: {app: aiDeployment.metadata.name},
        ports: [{port: 8000}],
    },
});

const frontendDeployment = new k8s.apps.v1.Deployment("frontend", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        selector: {matchLabels: {app: "frontend"}},
        replicas: 1,
        template: {
            metadata: {labels: {app: "frontend"}},
            spec: {
                containers: [
                    {
                        name: "frontend",
                        image: `ghcr.io/a-h-i/sprint-sync:latest`,
                        args: ["frontend"],
                        env: [
                            {
                                name: 'API_URL',
                                value: `http://${backendService.metadata.name}.${backendService.metadata.namespace}.svc.cluster.local:3000`
                            },
                            {
                                name: 'AI_API_URL',
                                value: `http://${aiService.metadata.name}.${aiService.metadata.namespace}.svc.cluster.local:8000`
                            },
                        ],
                        ports: [{containerPort: 3000}],
                        readinessProbe: {
                            tcpSocket: {port: 3000},
                            initialDelaySeconds: 5,
                            periodSeconds: 10,
                            failureThreshold: 6,
                        },
                    }
                ]
            }
        }
    }
});

const frontendService = new k8s.core.v1.Service("frontend-svc", {
    metadata: {
        name: frontendDeployment.metadata.name,
        namespace: appNamespace.metadata.name,
    },
    spec: {
        selector: {app: frontendDeployment.metadata.name},
        ports: [{port: 3000}],
    },
});

// Ingress just for backend, with regex + rewrite
const backendIngress = new k8s.networking.v1.Ingress("ingress-backend", {
    metadata: {
        name: "ingress-backend",
        namespace: appNamespace.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "nginx",
            "nginx.ingress.kubernetes.io/use-regex": "true",
            "nginx.ingress.kubernetes.io/rewrite-target": "/$2",
        },
    },
    spec: {
        ingressClassName: "nginx",
        rules: [{
            http: {
                paths: [{
                    // strip /backend from the request path
                    path: "/backend(/|$)(.*)",
                    pathType: "ImplementationSpecific",
                    backend: {
                        service: { name: backendService.metadata.name, port: { number: 3000 } },
                    },
                }],
            },
        }],
    },
}, { provider: k8sProvider });

// Ingress for frontend (catch-all). No rewrite needed.
const frontendIngress = new k8s.networking.v1.Ingress("ingress-frontend", {
    metadata: {
        name: "ingress-frontend",
        namespace: appNamespace.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "nginx",
        },
    },
    spec: {
        ingressClassName: "nginx",
        rules: [{
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: { name: frontendService.metadata.name, port: { number: 3000 } },
                    },
                }],
            },
        }],
    },
}, { provider: k8sProvider });

const nginxServicePatch = new k8s.core.v1.ServicePatch("nginx-lb-patch", {
    metadata: {
        name: "ingress-nginx-controller",
        namespace: "ingress-nginx",
        annotations: {
            "service.beta.kubernetes.io/do-loadbalancer-ip": staticIp,
        },
    },
}, { provider: k8sProvider })
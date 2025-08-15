import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as random from "@pulumi/random";
import {FloatingIp} from "@pulumi/digitalocean";

const dbConfig = new pulumi.Config("db");
const dbUser = dbConfig.require("username");
const dbPassword = dbConfig.requireSecret("password");
const dbName = dbConfig.require("name");

const openaiConfig = new pulumi.Config("openai");
const openaiApiKey = openaiConfig.requireSecret("token");

const authConfig = new pulumi.Config("auth");
const jwtToken = authConfig.requireSecret("jwt_token");

const imageConfig = new pulumi.Config("image");
const imageName = imageConfig.require("name");


const infra = new pulumi.StackReference("a-h-i/sprint-sync-infra/production");
const kubeconfig = infra.getOutput("kubeconfig");


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

const jwtSecret = new k8s.core.v1.Secret("jwt-secret", {
    metadata: {namespace: appNamespace.metadata.name},
    stringData: {
        JWT_SECRET: jwtToken,
    },
}, {provider: k8sProvider},)

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
                                mountPath: "/var/lib/postgresql",
                            },
                        ],
                        readinessProbe: {
                            exec: {command: ["sh", "-c", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]},
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
        name: 'postgres',
        namespace: appNamespace.metadata.name,

    },
    spec: {
        selector: {app: 'postgres'},
        ports: [{port: 5432}],
    },
}, {provider: k8sProvider});

const pgWaitCmd = pulumi.interpolate`until nc -z ${pgService.metadata.name}.${appNamespace.metadata.name}.svc.cluster.local 5432; do echo waiting for postgres; sleep 2; done;`;


const backendDeployment = new k8s.apps.v1.Deployment("backend", {
    metadata: {namespace: appNamespace.metadata.name},
    spec: {
        selector: {matchLabels: {app: "backend"}},
        replicas: 1,
        template: {
            metadata: {labels: {app: "backend"}},
            spec: {
                initContainers: [{
                    name: "wait-for-db",
                    image: "busybox:1.36",
                    command: ["sh", "-c"],
                    args: [pgWaitCmd],
                }],
                containers: [
                    {
                        name: "backend",
                        image: `ghcr.io/a-h-i/sprint-sync:${imageName}`,
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
                                value: pulumi.interpolate`${pgService.metadata.name}.${pgService.metadata.namespace}.svc.cluster.local`
                            },
                            {name: "PG_MASTER_PORT", value: "5432"},
                            {
                                name: "JWT_SECRET",
                                valueFrom: {secretKeyRef: {name: jwtSecret.metadata.name, key: "JWT_SECRET"}}
                            }
                        ],
                    },
                ],
            },
        },
    },
}, {provider: k8sProvider});

const backendService = new k8s.core.v1.Service("backend-svc", {
    metadata: {
        name: 'backend',
        namespace: appNamespace.metadata.name,
    },
    spec: {
        selector: {app: 'backend'},
        ports: [{port: 3000}],
    },
}, {
    provider: k8sProvider,
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
                        image: `ghcr.io/a-h-i/sprint-sync:${imageName}`,
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
}, {
    provider: k8sProvider,
});
const aiService = new k8s.core.v1.Service("ai-svc", {
    metadata: {
        name: 'ai',
        namespace: appNamespace.metadata.name,
    },
    spec: {
        selector: {app: 'ai'},
        ports: [{port: 8000}],
    },
}, {
    provider: k8sProvider,
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
                            image: `ghcr.io/a-h-i/sprint-sync:${imageName}`,
                            args: ["frontend"],
                            env: [
                                {
                                    name: 'API_URL',
                                    value: pulumi.interpolate`http://${backendService.metadata.name}.${backendService.metadata.namespace}.svc.cluster.local:3000`
                                },
                                {
                                    name: 'AI_API_URL',
                                    value: pulumi.interpolate`http://${aiService.metadata.name}.${aiService.metadata.namespace}.svc.cluster.local:8000`
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
    },
    {
        provider: k8sProvider,
    });

const frontendService = new k8s.core.v1.Service("frontend-svc", {
        metadata: {
            name: 'frontend',
            namespace: appNamespace.metadata.name,
        },
        spec: {
            selector: {app: 'frontend'},
            ports: [{port: 3000}],
        },
    },
    {
        provider: k8sProvider,
    });


const obsNs = new k8s.core.v1.Namespace("observability", {
    metadata: {name: "observability"},
}, {provider: k8sProvider});

const grafanaCfg = new pulumi.Config("grafana");
const grafanaAdminPassword = grafanaCfg.requireSecret("adminPassword");

const loki = new k8s.helm.v3.Chart("loki", {
    chart: "loki",
    fetchOpts: {repo: "https://grafana.github.io/helm-charts"},
    namespace: obsNs.metadata.name,
    values: {
        deploymentMode: "SingleBinary<->SimpleScalable",
        singleBinary: {
            replicas: 1,
            persistence: {
                enabled: true,
                size: "10Gi",
                storageClassName: "do-block-storage",
            },
            resources: {
                requests: {cpu: "100m", memory: "256Mi"},
                limits: {cpu: "500m", memory: "512Mi"},
            },
        },
        minio: {enabled: false},
        chunksCache: {enabled: false},
        resultsCache: {enabled: false},
        loki: {
            auth_enabled: false,
            storage: {type: "filesystem"},
            commonConfig: {replication_factor: 1},
            storage_config: {
                filesystem: {
                    directory: "/var/loki",
                },
            },
            schemaConfig: {
                configs: [{
                    from: "2024-04-01",
                    store: "tsdb",
                    object_store: "filesystem",
                    schema: "v13",
                    index: {prefix: "loki_index_", period: "24h"},
                }],
            },
            pattern_ingester: {
                enabled: true,
            },
            limits_config: {
                allow_structured_metadata: true,
                retention_period: "7d",
            },
            ruler: {enabled_api: true},
            backend: {replicas: 0},
            read: {replicas: 0},
            write: {replicas: 0},
            queryFrontend: {replicas: 0},
            queryScheduler: {replicas: 0},
            indexGateway: {replicas: 0},
            bloomCompactor: {replicas: 0},
            bloomGateway: {replicas: 0},
            resultsCache: {enabled: false},
            chunksCache: {enabled: false},
            gateway: {enabled: true},
        },
    },
}, {provider: k8sProvider});

const promtail = new k8s.helm.v3.Chart("promtail", {
    chart: "promtail",
    fetchOpts: {repo: "https://grafana.github.io/helm-charts"},
    namespace: obsNs.metadata.name,
    values: {
        // Point to the Loki service installed above
        config: {
            clients: [
                {url: "http://loki-gateway.observability.svc.cluster.local/loki/api/v1/push"}
            ],
        },
        // DaemonSet that tails /var/log/containers etc. defaults are fine
    },
}, {provider: k8sProvider, dependsOn: [loki]});



const ingressNs = new k8s.core.v1.Namespace("ingress-nginx-ns", {
    metadata: {name: "ingress-nginx"},
}, {provider: k8sProvider});


const ingressNginx = new k8s.helm.v3.Chart("ingress-nginx", {
    chart: "ingress-nginx",
    version: "4.13.1",
    fetchOpts: {repo: "https://kubernetes.github.io/ingress-nginx"},
    namespace: ingressNs.metadata.name,
    values: {
        controller: {
            service: {
                type: "LoadBalancer",
            },
            admissionWebhooks: {
                enabled: true,
                patch: {enabled: true},
            }
        },
    },
}, {
    provider: k8sProvider,
    dependsOn: [ingressNs],
});
const ingressStatus = ingressNginx.getResourceProperty(
    "v1/Service",
    "ingress-nginx/ingress-nginx-controller",
    "status"
);

const lbHost = ingressStatus.apply(s =>
    s?.loadBalancer?.ingress?.[0]?.ip ??
    s?.loadBalancer?.ingress?.[0]?.hostname ?? ""
);
const grafana = new k8s.helm.v3.Chart("grafana", {
    chart: "grafana",
    fetchOpts: {repo: "https://grafana.github.io/helm-charts"},
    namespace: obsNs.metadata.name,
    values: {
        adminPassword: grafanaAdminPassword,
        persistence: {enabled: true, size: "5Gi"},
        service: {type: "ClusterIP"},

        // Provision Loki as a datasource automatically
        datasources: {
            "datasources.yaml": {
                apiVersion: 1,
                datasources: [{
                    name: "Loki",
                    type: "loki",
                    access: "proxy",
                    url: "http://loki.observability.svc.cluster.local:3100",
                    isDefault: true,
                }],
            },
        },

        "grafana.ini": {
            server: {
                root_url: "%(protocol)s://%(domain)s/grafana",
                serve_from_sub_path: true,
                domain: lbHost,
            },
        },
    },
}, {provider: k8sProvider, dependsOn: [loki, ingressNginx]});
const grafanaIngress = new k8s.networking.v1.Ingress("grafana-ingress", {
    metadata: {
        name: "grafana-ingress",
        namespace: obsNs.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "nginx",
        },
    },
    spec: {
        ingressClassName: "nginx",
        rules: [{
            http: {
                paths: [{
                    path: "/grafana",
                    pathType: "Prefix",
                    backend: {
                        service: {name: "grafana", port: {number: 80}},
                    },
                }],
            },
        }],
    },
}, {provider: k8sProvider, dependsOn: [grafana, ingressNginx]});

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
                    path: "/backend(/|$)(.*)",
                    pathType: "ImplementationSpecific",
                    backend: {
                        service: {name: 'backend', port: {number: 3000}},
                    },
                }],
            },
        }],
    },
}, {provider: k8sProvider, dependsOn: [ingressNginx]});

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
                        service: {name: 'frontend', port: {number: 3000}},
                    },
                }],
            },
        }],
    },
}, {provider: k8sProvider, dependsOn: [ingressNginx]});


// Seeding the database

const seederCfg = new pulumi.Config("seeder");
const runId = seederCfg.get("runId") || pulumi.getStack(); // fallback so it has a stable value

// Random suffix changes whenever runId changes → forces a new Job
const seedSuffix = new random.RandomString("seed-suffix", {
    length: 6,
    upper: false,
    special: false,
    keepers: {runId}, // when runId changes, this resource is replaced
});

// Kubernetes Job to seed the DB
const dbSeedJob = new k8s.batch.v1.Job("db-seed", {
    metadata: {
        namespace: appNamespace.metadata.name,
        name: pulumi.interpolate`db-seed-${seedSuffix.result}`,

    },
    spec: {
        backoffLimit: 1,
        ttlSecondsAfterFinished: 600, // auto-clean after 10 minutes
        template: {
            metadata: {labels: {app: "db-seed"}},
            spec: {
                restartPolicy: "Never",
                // Wait for Postgres before running seeder
                initContainers: [{
                    name: "wait-for-db",
                    image: "busybox:1.36",
                    command: ["sh", "-c"],
                    args: [pgWaitCmd],
                }],
                containers: [{
                    name: "seeder",
                    image: `ghcr.io/a-h-i/sprint-sync:${imageName}`,
                    args: ["seeder"],
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
                            value: pulumi.interpolate`${pgService.metadata.name}.${pgService.metadata.namespace}.svc.cluster.local`
                        },
                        {name: "PG_MASTER_PORT", value: "5432"},
                        {
                            name: "JWT_SECRET",
                            valueFrom: {secretKeyRef: {name: jwtSecret.metadata.name, key: "JWT_SECRET"}}
                        }
                    ],
                }],
            },
        },
    },
}, {
    provider: k8sProvider,
    deleteBeforeReplace: true,
    dependsOn: [pgService],
});


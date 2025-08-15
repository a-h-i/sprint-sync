import * as digitalocean from "@pulumi/digitalocean";


export const cluster = new digitalocean.KubernetesCluster("do-cluster", {
    region: "fra1",
    version: "1.33.1-do.3",
    nodePool: {
        name: "default-pool",
        size: "s-2vcpu-4gb",
        nodeCount: 2,
    },
});

// Export kubeconfig for app stack to use
export const kubeconfig = cluster.kubeConfigs[0].rawConfig;

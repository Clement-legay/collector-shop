# Kubernetes Manifests

Ce dossier contiendra les manifests Kubernetes pour le déploiement sur Minikube.

## Structure prévue (Prompt 3)

```
kubernetes/
├── namespace.yaml
├── configmaps/
│   └── common-config.yaml
├── secrets/
│   └── db-credentials.yaml
├── services/
│   ├── article-service.yaml
│   ├── user-service.yaml
│   ├── payment-service.yaml
│   └── fraud-detection-service.yaml
├── deployments/
│   ├── article-service.yaml
│   ├── user-service.yaml
│   ├── payment-service.yaml
│   └── fraud-detection-service.yaml
├── infrastructure/
│   ├── postgresql.yaml
│   ├── rabbitmq.yaml
│   ├── jaeger.yaml
│   └── prometheus-grafana.yaml
└── ingress.yaml
```

## À implémenter
- [ ] Namespace `collector-shop`
- [ ] ConfigMaps pour variables d'environnement
- [ ] Secrets pour credentials DB/RabbitMQ
- [ ] Deployments pour chaque service
- [ ] Services (ClusterIP/LoadBalancer)
- [ ] Ingress pour accès externe
- [ ] PersistentVolumeClaims pour PostgreSQL

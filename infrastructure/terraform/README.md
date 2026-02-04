# Terraform AWS

Ce dossier contiendra la configuration Terraform pour le déploiement AWS.

## Structure prévue (Prompt 3)

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
├── modules/
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   ├── mq/
│   └── monitoring/
└── environments/
    ├── dev/
    └── prod/
```

## Ressources AWS prévues
- [ ] VPC avec subnets publics/privés
- [ ] EKS cluster (Kubernetes managé)
- [ ] RDS PostgreSQL
- [ ] Amazon MQ (RabbitMQ)
- [ ] CloudWatch / X-Ray pour observabilité
- [ ] ECR pour images Docker
- [ ] ALB Ingress Controller

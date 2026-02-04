# Deployment on AWS

This guide explains how to deploy the Collector application to AWS using the Terraform configurations provided in `infrastructure/terraform`.

## Architecture
The AWS infrastructure consists of:
- **EKS Cluster**: Runs the application workloads.
- **RDS (PostgreSQL)**: Managed database service.
- **EC2 (RabbitMQ)**: Self-managed RabbitMQ instance (cost-optmized).
- **VPC**: Secure networking with public/private subnets.

## Deployment Steps

1. **Provision Infrastructure**
   Follow the [Terraform README](../infrastructure/terraform/README.md) to provision the resources.

2. **Configure Kubernetes Connection**
   ```bash
   aws eks update-kubeconfig --region eu-west-1 --name collector-cluster
   ```

3. **Update Manifests**
   Before deploying, you must update the `infrastructure/kubernetes` manifests to point to the AWS resources instead of internal K8s services.

   - **Services (Article, User, Payment, Fraud)**:
     - Update `DATABASE_HOST` to the RDS Endpoint (from Terraform output `rds_endpoint`).
     - Update `RABBITMQ_HOST` to the RabbitMQ Private IP (from Terraform output `rabbitmq_private_ip`).

4. **Deploy Application**
   ```bash
   kubectl apply -R -f infrastructure/kubernetes
   ```

## Production Considerations
- **Secrets**: Use AWS Secrets Manager or Sealed Secrets instead of environment variables in manifests.
- **Scaling**: Adjust EKS node group and pod replicas.
- **Monitoring**: Clean up the Jaeger/Prometheus manifests if migrating to managed services like AWS Managed Prometheus.

# Deploy AWS with Terraform

## Prerequisites
- AWS CLI configured (`aws configure`)
- Terraform >= 1.0 installed
- `kubectl` installed

## Infrastructure Components
- **VPC**: Private and Public subnets, NAT Gateway.
- **EKS**: Managed Kubernetes cluster (2 nodes).
- **RDS**: PostgreSQL 15 (Free tier/Dev config).
- **EC2**: RabbitMQ instance (t3.small).

## Deployment Steps

1. **Initialize Terraform**
   ```bash
   terraform init
   ```

2. **Plan Deployment**
   ```bash
   terraform plan -out=tfplan -var="db_username=collector" -var="db_password=secure_password"
   ```

3. **Apply Deployment**
   ```bash
   terraform apply tfplan
   ```

4. **Connect to EKS**
   ```bash
   aws eks update-kubeconfig --region eu-west-1 --name collector-cluster
   ```

## Post-Deployment
- Update your Kubernetes Service manifests to point to the RDS endpoint and RabbitMQ Private IP instead of in-cluster services.
- Apply manifests via `kubectl` or ArgoCD.

## Cleanup
To destroy all resources:
```bash
terraform destroy -var="db_username=collector" -var="db_password=secure_password"
```

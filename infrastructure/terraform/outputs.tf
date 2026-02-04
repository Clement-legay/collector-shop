output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rabbitmq_private_ip" {
  description = "Private IP of RabbitMQ EC2 instance"
  value       = aws_instance.rabbitmq.private_ip
}

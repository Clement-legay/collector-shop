variable "aws_region" {
  description = "AWS Region"
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  default     = "dev"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

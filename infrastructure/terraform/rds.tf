resource "aws_db_subnet_group" "collector" {
  name       = "collector-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "My DB subnet group"
  }
}

resource "aws_security_group" "rds" {
  name        = "collector_rds_sg"
  description = "Allow inbound traffic from EKS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from VPC"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "collector-db"
  allocated_storage    = 20
  storage_type         = "gp3"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro" # Free tier eligible / dev
  db_name              = "collector"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  
  db_subnet_group_name   = aws_db_subnet_group.collector.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  multi_az = false # Dev mode

  tags = {
    Environment = var.environment
  }
}

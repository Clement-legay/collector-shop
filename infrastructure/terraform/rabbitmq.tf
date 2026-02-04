resource "aws_security_group" "rabbitmq" {
  name        = "collector_rabbitmq_sg"
  description = "Allow RabbitMQ traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "AMQP"
    from_port   = 5672
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  ingress {
    description = "Management UI"
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Should be restricted in production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "rabbitmq" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  subnet_id     = module.vpc.private_subnets[0]
  
  vpc_security_group_ids = [aws_security_group.rabbitmq.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y erlang
              apt-get install -y rabbitmq-server
              systemctl enable rabbitmq-server
              systemctl start rabbitmq-server
              rabbitmq-plugins enable rabbitmq_management
              echo "loopback_users = none" >> /etc/rabbitmq/rabbitmq.conf
              service rabbitmq-server restart
              rabbitmqctl add_user guest guest
              rabbitmqctl set_user_tags guest administrator
              rabbitmqctl set_permissions -p / guest ".*" ".*" ".*"
              EOF

  tags = {
    Name = "collector-rabbitmq"
    Environment = var.environment
  }
}

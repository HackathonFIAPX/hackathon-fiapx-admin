resource "aws_instance" "ecs_instance" {
  ami                         = "ami-001338ee8479f6dc1"
  instance_type               = "t3.medium"
  subnet_id                   = data.terraform_remote_state.network.outputs.main_public_subnet_a_id
  vpc_security_group_ids      = [data.terraform_remote_state.network.outputs.main_sg_id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ecs_instance_profile.name

  user_data = <<-EOF
              #!/bin/bash
              set -ex
              
              yum update -y
              yum install -y ecs-init

              echo "ECS_CLUSTER=${aws_ecs_cluster.ecs_cluster.name}" >> /etc/ecs/ecs.config
              echo "ECS_BACKEND_HOST=" >> /etc/ecs/ecs.config
              
              systemctl enable --now ecs
  EOF

  tags = {
    Name = "fiapx-admin-ec2-cluster"
  }
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "admin-ecs-profile"
  role = "LabRole"
}
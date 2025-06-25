resource "aws_lb" "ecs_lb" {
  name               = "fiapx-admin-service-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [data.terraform_remote_state.network.outputs.main_sg_id]
  subnets            = [data.terraform_remote_state.network.outputs.main_public_subnet_a_id, data.terraform_remote_state.network.outputs.main_public_subnet_b_id]

  enable_deletion_protection = false

  tags = {
    Name = "fiapx-admin-service-lb"
  }
}

resource "aws_lb_target_group" "ecs_target_group" {
  name        = "fiapx-admin-service-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.network.outputs.main_vpc_id

  health_check {
    interval            = 30
    path                = "/admin-api/health/liveness"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 5
    port                = "traffic-port"
  }
}

resource "aws_lb_listener" "ecs_listener" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_target_group.arn
  }
}
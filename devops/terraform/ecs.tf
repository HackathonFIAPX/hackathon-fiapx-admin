resource "aws_ecs_cluster" "ecs_cluster" {
  name = "fiapx-admin-service"
}

resource "aws_ecs_service" "app_service" {
  name                    = "fiapx-admin-service"
  cluster                 = aws_ecs_cluster.ecs_cluster.id
  task_definition         = aws_ecs_task_definition.app_task.arn
  desired_count           = 1
  launch_type             = "FARGATE"
  force_new_deployment    = true

  network_configuration {
    subnets          = [aws_subnet.private.id]
    security_groups  = [data.terraform_remote_state.network.outputs.main_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_target_group.arn
    container_name   = "fiapx-admin-service"
    container_port   = 3000
  }

  deployment_controller {
    type = "ECS"
  }

  depends_on = [aws_lb_listener.ecs_listener]
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "fiapx-admin-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  task_role_arn            = data.aws_iam_role.lab_role.arn
  execution_role_arn       = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "fiapx-admin-service"
      image     = "loadinggreg/hackathon-fiapx-admin:${var.tc_image_tag}"
      cpu       = 256
      memory    = 512
      essential = true

      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/admin-api/health/liveness || exit 1"]
        interval = 30
        retries  = 5
        start_period = 60
        timeout = 5
      }

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/fiapx-admin-service"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app-ecs"
        }
      }
      
      environment = [
        {
          name  = "DYNAMODB_REGION"
          value = var.aws_region
        },
        {
          name  = "DYNAMODB_TABLE"
          value = "fiapx-admin"
        },
        {
          name  = "APP_NAME"
          value = "admin-api"
        },
        {
          name  = "AWS_ACCESS_KEY_ID"
          value = var.aws_access_key_id
        },
        {
          name  = "AWS_SECRET_ACCESS_KEY"
          value = var.aws_secret_access_key
        },
        {
          name  = "AWS_SESSION_TOKEN"
          value = var.aws_session_token
        },
        {
          name  = "ENVIRONMENT"
          value = "production"
        },
        {
          name = "HOST"
          value = "0.0.0.0"
        },
        {
          name  = "S3_BUCKET_NAME"
          value = aws_s3_bucket.video_upload_bucket.bucket
        },
        {
          name  = "COGNITO_USER_POOL_ID"
          value = aws_cognito_user_pool.app_user_pool.id
        },
        {
          name  = "COGNITO_CLIENT_ID"
          value = aws_cognito_user_pool_client.app_client.id
        },
        {
          name  = "COGNITO_REGION"
          value = var.aws_region
        }
      ]
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name = "/ecs/fiapx-admin-service"
}

resource "aws_appautoscaling_target" "ecs_service_scale_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.app_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 3
}

resource "aws_appautoscaling_policy" "ecs_cpu_scaling_policy" {
  name               = "fiapx-admin-cpu-scaling-policy"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.ecs_service_scale_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_service_scale_target.scalable_dimension

  policy_type = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 80

    scale_in_cooldown  = 300
    scale_out_cooldown = 30
  }

  depends_on = [aws_ecs_service.app_service]
}
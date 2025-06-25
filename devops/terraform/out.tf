output "admin_service_api_url" {
  value = aws_apigatewayv2_api.ecs_api.api_endpoint
}
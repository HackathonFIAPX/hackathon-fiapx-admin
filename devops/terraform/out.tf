output "admin_service_api_url" {
  value = aws_apigatewayv2_api.ecs_api.api_endpoint
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app_client.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.app_user_pool.id
}
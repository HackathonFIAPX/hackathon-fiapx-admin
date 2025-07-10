output "admin_service_api_url" {
  value = aws_apigatewayv2_api.ecs_api.api_endpoint
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.app_client.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.app_user_pool.id
}

output "upload_video_sns_topic_arn" {
  value = aws_sns_topic.video_upload_topic.arn
}

output "admin_service_api_url" {
  value = aws_apigatewayv2_api.ecs_api.api_endpoint
}
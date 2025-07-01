resource "aws_cognito_user_pool" "app_user_pool" {
  name = "fiapx-admin-user-pool"

  username_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }
}

resource "aws_cognito_user_pool_client" "app_client" {
  name         = "fiapx-admin-client"
  user_pool_id = aws_cognito_user_pool.app_user_pool.id
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"

  allowed_oauth_flows_user_pool_client = false
}

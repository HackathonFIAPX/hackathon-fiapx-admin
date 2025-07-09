resource "aws_dynamodb_table" "example" {
  name           = "fiapx-admin"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "clientId"
    type = "S"
  }

  global_secondary_index {
    name               = "clientId-index"
    hash_key           = "clientId"
    projection_type    = "ALL"
  }

  tags = {
    Environment = "dev"
    Projeto     = "fiapx-admin"
  }
}
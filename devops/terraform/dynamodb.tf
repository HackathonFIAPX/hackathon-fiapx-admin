resource "aws_dynamodb_table" "example" {
  name           = "fiapx-admin"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "client_id"
    type = "S"
  }

  global_secondary_index {
    name               = "client_id-index"
    hash_key           = "client_id"
    projection_type    = "ALL"
  }

  tags = {
    Environment = "dev"
    Projeto     = "fiapx-admin"
  }
}
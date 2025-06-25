resource "aws_dynamodb_table" "example" {
  name           = "fiapx-admin"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = "dev"
    Projeto     = "fiapx-admin"
  }
}

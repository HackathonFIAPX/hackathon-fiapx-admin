data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = var.aws_bucket_name
    key    = "network/terraform.tfstate"
    region = var.aws_region
  }
}

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}
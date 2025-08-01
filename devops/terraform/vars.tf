variable "tc_image_tag" {
  description = "Tag for the docker image"
  type        = string
}

variable "aws_access_key_id" {
  description = "AWS Access Key"
  type        = string
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
}

variable "aws_session_token" {
  description = "AWS Session Token"
  type        = string
}

variable "aws_bucket_name" {
  description = "Bucket name for S3"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}
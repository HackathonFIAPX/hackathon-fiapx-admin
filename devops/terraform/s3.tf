resource "aws_s3_bucket" "video_upload_bucket" {
  bucket = "fiapx-video-upload-bucket"
  acl    = "private"

  tags = {
    Name        = "fiapx-video-upload-bucket"
    Environment = "Production"
  }
}
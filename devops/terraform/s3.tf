resource "aws_s3_bucket" "video_upload_bucket" {
  bucket = "fiapx-video-upload-bucket"
  acl    = "private"

  tags = {
    Name        = "fiapx-video-upload-bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "video_expiration_rule" {
  bucket = aws_s3_bucket.video_upload_bucket.id

  rule {
    id     = "exclude_videos_after_1_days"
    status = "Enabled"

    filter {
      prefix = "temp_videos/"
    }

    expiration {
      days = 1
    }
  }
}
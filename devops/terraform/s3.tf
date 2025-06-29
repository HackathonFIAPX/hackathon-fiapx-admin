resource "aws_s3_bucket" "video_upload_bucket" {
  bucket = "fiapx-video-upload-bucket"
  acl    = "private"

  tags = {
    Name        = "fiapx-video-upload-bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "zip_expiration_rule" {
  bucket = aws_s3_bucket.meu_bucket_uploads_curtas.id

  rule {
    id     = "exclude_zip_images_after_3_days"
    status = "Enabled"

    filter {
      prefix = "temp_zips/"
    }

    expiration {
      days = 3
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "video_expiration_rule" {
  bucket = aws_s3_bucket.meu_bucket_uploads_curtas.id

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
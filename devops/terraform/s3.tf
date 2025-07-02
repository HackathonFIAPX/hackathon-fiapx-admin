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

resource "aws_s3_bucket_notification" "video_upload_notification" {
  bucket = aws_s3_bucket.video_upload_bucket.id

  topic {
    topic_arn     = aws_sns_topic.video_upload_topic.arn
    events        = ["s3:ObjectCreated:Put"]
    filter_prefix = "temp_videos/"
    filter_suffix = ".mp4"
  }

  depends_on = [aws_sns_topic_policy.allow_s3_publish]
}

resource "aws_sns_topic_policy" "allow_s3_publish" {
  arn = aws_sns_topic.video_upload_topic.arn

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "s3.amazonaws.com"
        },
        Action = "SNS:Publish",
        Resource = aws_sns_topic.video_upload_topic.arn,
        Condition = {
          ArnLike = {
            "aws:SourceArn" = aws_s3_bucket.video_upload_bucket.arn
          }
        }
      }
    ]
  })
}
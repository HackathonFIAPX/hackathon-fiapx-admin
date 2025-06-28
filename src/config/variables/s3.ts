import env from 'env-var';

export const envS3 = Object.freeze({
    bucketName: env.get('S3_BUCKET_NAME')?.toString(),
})
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IS3Handler, TGetPresignedUrlParams, TGetPresignedUrlResponse } from "./IS3Handler";
import { envAWS } from "@config/variables/aws";
import { envS3 } from "@config/variables/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: envAWS.region,
    credentials: {
        accessKeyId: envAWS.accessKeyId,
        secretAccessKey: envAWS.secretAccessKey,
        sessionToken: envAWS.awsSessionToken,
    }
});

export class S3Handler implements IS3Handler {
    public async getPresignedUrl(input: TGetPresignedUrlParams): Promise<TGetPresignedUrlResponse> {
        const { uploadType, fileName, fileType, contentLength, expiresIn } = input;

        const key = `${uploadType}/${fileName}.${fileType}`;
        
        const command = new PutObjectCommand({
            Bucket: envS3.bucketName,
            Key: key,
            ContentType: `video/${fileType}`,
            ContentLength: contentLength,
        })

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: expiresIn || 3600,
        })

        return {
            url: signedUrl,
            key: key
        }
    }
}
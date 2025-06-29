import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TVideoUploadFileType, TGetPresignedUrlParams, TGetPresignedUrlResponse } from "./TS3Handler";
import { envAWS } from "@config/variables/aws";
import { envS3 } from "@config/variables/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IS3Handler } from "./IS3Handler";
import { injectable } from "tsyringe";

const s3Client = new S3Client({
    region: envAWS.region,
    credentials: {
        accessKeyId: envAWS.accessKeyId,
        secretAccessKey: envAWS.secretAccessKey,
        sessionToken: envAWS.awsSessionToken,
    }
});

@injectable()
export class S3Handler implements IS3Handler {
    private availableContentTypes: { [K in TVideoUploadFileType]: string } = {
        mp4: 'video/mp4',
    }

    public async getPresignedUrl(input: TGetPresignedUrlParams): Promise<TGetPresignedUrlResponse> {
        const { uploadType, fileName, fileType, contentLength, expiresIn } = input;

        const key = `${uploadType}/${fileName}.${fileType}`;
        const contentType = this.availableContentTypes[fileType];

        if (!contentType) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        
        const command = new PutObjectCommand({
            Bucket: envS3.bucketName,
            Key: key,
            ContentType: contentType,
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
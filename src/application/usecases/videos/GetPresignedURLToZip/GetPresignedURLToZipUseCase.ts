import { injectable } from "tsyringe";
import { IGetPresignedURLToZipUseCase } from "./IGetPresignedURLToZipUseCase";
import { TGetPresignedURLToZipUseCaseInput, TGetPresignedURLToZipUseCaseOutput } from "./TGetPresignedURLToZipUseCase";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { envAWS } from "@config/variables/aws";
import { envS3 } from "@config/variables/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@injectable()
export class GetPresignedURLToZipUseCase implements IGetPresignedURLToZipUseCase {
    async execute(input: TGetPresignedURLToZipUseCaseInput): Promise<TGetPresignedURLToZipUseCaseOutput> {
        const { clientId, videoId } = input;

        const s3Client = new S3Client({
            region: envAWS.region,
            credentials: {
                accessKeyId: envAWS.accessKeyId,
                secretAccessKey: envAWS.secretAccessKey,
                sessionToken: envAWS.awsSessionToken,
            }
        });

        const bucketName = 'fiapx-video-fps-bucket';

        const key = `${clientId}/${videoId}/final_result.zip`;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
            presignedUrl: url,
        };
    }
}
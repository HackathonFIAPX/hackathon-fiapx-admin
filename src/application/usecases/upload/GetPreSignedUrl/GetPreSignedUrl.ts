import { inject, injectable } from "tsyringe";
import { IGetPreSignedUrl } from "./IGetPreSignedUrl";
import { IS3Handler } from "@infra/aws/s3/IS3Handler";
import { TGetPreSignedUrlInput, TGetPreSignedUrlOutput } from "./TGetPreSignedUrl";

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

@injectable()
export class GetPresignedUrl implements IGetPreSignedUrl {
    constructor(
        @inject('IS3Handler')
        private readonly s3Handler: IS3Handler
    ) {}

    async execute(input: TGetPreSignedUrlInput): Promise<TGetPreSignedUrlOutput> {
        const { fileType, contentLength } = input;

        const fileName = `teste-${Date.now()}`;

        if (contentLength > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
        }

        const presignedUrl = await this.s3Handler.getPresignedUrl({
            uploadType: 'video',
            fileName,
            fileType,
            expiresIn: 3600, // 1 hour
            contentLength,
        });

        return {
            url: presignedUrl.url,
            key: presignedUrl.key,
        };
    }
}
import { inject, injectable } from "tsyringe";
import { IGetPreSignedUrlUseCase } from "./IGetPreSignedUrlUseCase";
import { IS3Handler } from "@infra/aws/s3/IS3Handler";
import { TGetPreSignedUrlUseCaseInput, TGetPreSignedUrlUseCaseOutput } from "./TGetPreSignedUrlUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { v4 as uuidv4 } from 'uuid';
import { Video } from "@domain/models/Video";
import { EVideoStatus } from "@domain/models/EVideoStatus";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 10 GB

@injectable()
export class GetPreSignedUrlUseCase implements IGetPreSignedUrlUseCase {
    constructor(
        @inject('IS3Handler')
        private readonly s3Handler: IS3Handler,
        @inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(input: TGetPreSignedUrlUseCaseInput): Promise<TGetPreSignedUrlUseCaseOutput> {
        const { fileType, contentLength, clientId } = input;

        const userFound = await this.userRepository.findByClientId(clientId);
        if (!userFound) {
            throw new Error('User not found');
        }

        if (contentLength > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
        }

        const fileId = uuidv4();
        const fileName = `${clientId}/${fileId}`;

        const video = new Video()
        video.id = fileId,
        video.name = fileId,
        video.status = EVideoStatus.UPLOAD_PENDING,
        video.url = '',
        
        await this.userRepository.addVideoToUser(clientId, video)

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
import { S3Handler } from './S3Handler';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@infra/utils/logger/Logger';
import { TGetPresignedUrlParams, TVideoUploadFileType, TUploadType } from './TS3Handler';
import { envS3 } from '@config/variables/s3';

// Mock external modules
jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(() => ({
        send: jest.fn(),
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => params), // Mock the constructor
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn(),
}));

jest.mock('@config/variables/aws', () => ({
    envAWS: {
        region: 'mock-region',
        accessKeyId: 'mock-access-key',
        secretAccessKey: 'mock-secret-key',
        awsSessionToken: 'mock-session-token',
    },
}));

jest.mock('@config/variables/s3', () => ({
    envS3: {
        bucketName: 'mock-bucket',
    },
}));

jest.mock('@infra/utils/logger/Logger', () => ({
    Logger: {
        info: jest.fn(),
    },
}));

describe('S3Handler', () => {
    let s3Handler: S3Handler;
    const mockGetSignedUrl = getSignedUrl as jest.Mock;
    const mockPutObjectCommand = PutObjectCommand as unknown as jest.Mock;
    const mockLoggerInfo = Logger.info as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        s3Handler = new S3Handler();
    });

    it('should successfully generate a presigned URL for video upload', async () => {
        const input: TGetPresignedUrlParams = {
            uploadType: 'video',
            fileName: 'test-video',
            fileType: 'mp4',
            contentLength: 1024,
            expiresIn: 3600,
        };
        const expectedSignedUrl = 'https://mock-signed-url.com';
        const expectedKey = 'temp_videos/test-video.mp4';

        mockGetSignedUrl.mockResolvedValue(expectedSignedUrl);

        const result = await s3Handler.getPresignedUrl(input);

        expect(mockPutObjectCommand).toHaveBeenCalledWith({
            Bucket: envS3.bucketName,
            Key: expectedKey,
            ContentType: 'video/mp4',
            ContentLength: input.contentLength,
        });
        expect(mockGetSignedUrl).toHaveBeenCalledWith(
            expect.any(Object),
            {
                Bucket: envS3.bucketName,
                Key: expectedKey,
                ContentType: 'video/mp4',
                ContentLength: input.contentLength,
            },
            { expiresIn: input.expiresIn }
        );
        expect(mockLoggerInfo).toHaveBeenCalledWith({
            message: 'S3Handler',
            additionalInfo: {
                Bucket: 'mock-bucket',
                Key: expectedKey,
                ContentType: 'video/mp4',
                ContentLength: input.contentLength,
            },
        });
        expect(result).toEqual({
            url: expectedSignedUrl,
            key: expectedKey,
        });
    });

    it('should use default expiresIn if not provided', async () => {
        const input: TGetPresignedUrlParams = {
            uploadType: 'video',
            fileName: 'test-video',
            fileType: 'mp4',
            contentLength: 1024,
        };
        const expectedSignedUrl = 'https://mock-signed-url.com';

        mockGetSignedUrl.mockResolvedValue(expectedSignedUrl);

        await s3Handler.getPresignedUrl(input);

        expect(mockGetSignedUrl).toHaveBeenCalledWith(
            expect.any(Object),
            {
                Bucket: envS3.bucketName,
                Key: `temp_videos/${input.fileName}.mp4`,
                ContentType: 'video/mp4',
                ContentLength: input.contentLength,
            },
            { expiresIn: 3600 }
        );
    });

    it('should throw an error for unsupported upload type', async () => {
        const input = {
            uploadType: 'unsupported' as TUploadType,
            fileName: 'test-file',
            fileType: 'mp4' as TVideoUploadFileType,
            contentLength: 1024,
        };

        await expect(s3Handler.getPresignedUrl(input as TGetPresignedUrlParams)).rejects.toThrow('Unsupported upload type: unsupported');
        expect(mockPutObjectCommand).not.toHaveBeenCalled();
        expect(mockGetSignedUrl).not.toHaveBeenCalled();
        expect(mockLoggerInfo).not.toHaveBeenCalled();
    });

    it('should throw an error for unsupported file type', async () => {
        const input = {
            uploadType: 'video' as TUploadType,
            fileName: 'test-file',
            fileType: 'unsupported' as TVideoUploadFileType,
            contentLength: 1024,
        };

        await expect(s3Handler.getPresignedUrl(input as TGetPresignedUrlParams)).rejects.toThrow('Unsupported file type: unsupported');
        expect(mockPutObjectCommand).not.toHaveBeenCalled();
        expect(mockGetSignedUrl).not.toHaveBeenCalled();
        expect(mockLoggerInfo).not.toHaveBeenCalled();
    });
});
import { GetPreSignedUrlUseCase } from './GetPreSignedUrlUseCase';
import { IS3Handler } from '@infra/aws/s3/IS3Handler';
import { TGetPreSignedUrlUseCaseInput, TGetPreSignedUrlUseCaseOutput } from './TGetPreSignedUrlUseCase';

// Mock IS3Handler
const mockGetPresignedUrl = jest.fn();
const mockS3Handler: IS3Handler = {
    getPresignedUrl: mockGetPresignedUrl,
};

describe('GetPreSignedUrlUseCase', () => {
    let useCase: GetPreSignedUrlUseCase;
    const originalDateNow = Date.now;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Date.now to ensure consistent fileName
        Date.now = jest.fn(() => 1678886400000); // March 15, 2023 00:00:00 GMT
        useCase = new GetPreSignedUrlUseCase(mockS3Handler);
    });

    afterEach(() => {
        Date.now = originalDateNow; // Restore original Date.now
    });

    it('should call s3Handler.getPresignedUrl with correct parameters and return url and key', async () => {
        const input: TGetPreSignedUrlUseCaseInput = {
            fileType: 'mp4',
            contentLength: 5 * 1024 * 1024, // 5 MB
            clientId: 'test-client-id',
        };
        const mockS3Response = {
            url: 'https://mock-presigned-url.s3.amazonaws.com/mock-key',
            key: 'mock-key',
        };
        mockGetPresignedUrl.mockResolvedValue(mockS3Response);

        const result = await useCase.execute(input);

        expect(mockGetPresignedUrl).toHaveBeenCalledTimes(1);
        expect(mockGetPresignedUrl).toHaveBeenCalledWith({
            uploadType: 'video',
            fileName: 'teste-1678886400000',
            fileType: 'mp4',
            expiresIn: 3600,
            contentLength: 5 * 1024 * 1024,
        });
        expect(result).toEqual({
            url: mockS3Response.url,
            key: mockS3Response.key,
        });
    });

    it('should throw an error if file size exceeds the maximum limit', async () => {
        const input: TGetPreSignedUrlUseCaseInput = {
            fileType: 'mp4',
            contentLength: 11 * 1024 * 1024 * 1024, // 11 GB (exceeds 10 GB limit)
            clientId: 'test-client-id',
        };

        await expect(useCase.execute(input)).rejects.toThrow(
            'File size exceeds the maximum limit of 10240 MB',
        );
        expect(mockGetPresignedUrl).not.toHaveBeenCalled();
    });
});
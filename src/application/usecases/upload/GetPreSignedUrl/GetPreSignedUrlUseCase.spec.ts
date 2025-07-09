import { GetPreSignedUrlUseCase } from './GetPreSignedUrlUseCase';
import { IS3Handler } from '@infra/aws/s3/IS3Handler';
import { TGetPreSignedUrlUseCaseInput } from './TGetPreSignedUrlUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/models/User';
import { EVideoStatus } from '@domain/models/EVideoStatus';

jest.mock('uuid', () => ({
	v4: () => 'mock-uuid-123',
}));

const mockGetPresignedUrl = jest.fn();
const mockS3Handler: IS3Handler = {
	getPresignedUrl: mockGetPresignedUrl,
};

const mockFindByClientId = jest.fn();
const mockAddVideoToUser = jest.fn();
const mockUserRepository: IUserRepository = {
	findByClientId: mockFindByClientId,
	addVideoToUser: mockAddVideoToUser,
	save: jest.fn(),
	updateVideo: jest.fn(),
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

describe('GetPreSignedUrlUseCase', () => {
	let useCase: GetPreSignedUrlUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new GetPreSignedUrlUseCase(mockS3Handler, mockUserRepository);
	});

	it('should generate a presigned URL and add video to user', async () => {
		const input: TGetPreSignedUrlUseCaseInput = {
			fileType: 'mp4',
			contentLength: 5 * 1024 * 1024, // 5 MB
			clientId: 'test-client-id',
		};

		const mockUser = new User();
		mockUser.id = 'user-123';
		mockUser.clientId = 'test-client-id';
		mockFindByClientId.mockResolvedValue(mockUser);

		const mockS3Response = {
			url: 'https://mock-presigned-url.s3.amazonaws.com/mock-key',
			key: 'mock-key',
		};
		mockGetPresignedUrl.mockResolvedValue(mockS3Response);

		const result = await useCase.execute(input);

		expect(mockFindByClientId).toHaveBeenCalledWith('test-client-id');
		expect(mockAddVideoToUser).toHaveBeenCalledWith('test-client-id', {
			id: 'mock-uuid-123',
			name: 'mock-uuid-123',
			status: EVideoStatus.UPLOAD_PENDING,
			url: '',
		});
		expect(mockGetPresignedUrl).toHaveBeenCalledWith({
			uploadType: 'video',
			fileName: 'test-client-id/mock-uuid-123',
			fileType: 'mp4',
			expiresIn: 3600,
			contentLength: 5 * 1024 * 1024,
		});
		expect(result).toEqual(mockS3Response);
	});

	it('should throw an error if user is not found', async () => {
		const input: TGetPreSignedUrlUseCaseInput = {
			fileType: 'mp4',
			contentLength: 5 * 1024 * 1024,
			clientId: 'non-existent-client',
		};

		mockFindByClientId.mockResolvedValue(null);

		await expect(useCase.execute(input)).rejects.toThrow('User not found');
		expect(mockGetPresignedUrl).not.toHaveBeenCalled();
	});

	it('should throw an error if file size exceeds the maximum limit', async () => {
		const input: TGetPreSignedUrlUseCaseInput = {
			fileType: 'mp4',
			contentLength: MAX_FILE_SIZE + 1,
			clientId: 'test-client-id',
		};

		const mockUser = new User();
		mockUser.id = 'user-123';
		mockUser.clientId = 'test-client-id';
		mockFindByClientId.mockResolvedValue(mockUser);

		await expect(useCase.execute(input)).rejects.toThrow(
			`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
		);
		expect(mockGetPresignedUrl).not.toHaveBeenCalled();
	});
});
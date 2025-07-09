import { UserRepository } from './user-repository';
import { User } from '@domain/models/User';
import { DynamoDBConnector } from '../dynamo-db-connector';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Video } from '@domain/models/Video';
import { EVideoStatus } from '@domain/models/EVideoStatus';

// Mock DynamoDBConnector
const mockGetDocumentClient = jest.fn();
const mockDynamoDBConnectorInstance = {
    getDocumentClient: mockGetDocumentClient,
};
jest.mock('../dynamo-db-connector', () => ({
    DynamoDBConnector: {
        getInstance: jest.fn(() => mockDynamoDBConnectorInstance),
    },
}));

// Mock DynamoDBDocumentClient's send method
const mockDynamoBDDocClientSend = jest.fn();
const mockDynamoBDDocClient = {
    send: mockDynamoBDDocClientSend,
};

// Mock PutCommand and QueryCommand
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    ...jest.requireActual('@aws-sdk/lib-dynamodb'),
    PutCommand: jest.fn().mockImplementation((input: any) => input), // Return input for easy assertion
    QueryCommand: jest.fn().mockImplementation((input: any) => input), // Return input for easy assertion
    UpdateCommand: jest.fn().mockImplementation((input: any) => input),
}));

// Mock envDynamoDB
jest.mock('@config/variables/dynamodb', () => ({
    envDynamoDB: {
        tableName: 'MockTableName',
    },
}));

// Mock uuidv4 (needed for UserModel.fromDomain)
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-123'),
}));

// Mock UserModel
jest.mock('../models/user.model', () => {
    const mockFromDomain = jest.fn();
    const mockFromDb = jest.fn();
    const mockToDomain = jest.fn();
    return {
        UserModel: {
            fromDomain: mockFromDomain,
            fromDb: mockFromDb,
            toDomain: mockToDomain,
        },
    };
});

// Define a type for the videos array in UserModel mocks (still needed for other mocks)
type UserModelVideo = { id: string; name: string; status: string; url: string };

describe('UserRepository', () => {
    let userRepository: UserRepository;

    // Get references to the mocked UserModel methods after the module is loaded
    const { fromDomain: mockFromDomain, fromDb: mockFromDb, toDomain: mockToDomain } = require('../models/user.model').UserModel;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetDocumentClient.mockReturnValue(mockDynamoBDDocClient);
        userRepository = new UserRepository();

        // Clear mocks on the UserModel methods
        mockFromDomain.mockClear();
        mockFromDb.mockClear();
        mockToDomain.mockClear();
    });

    describe('constructor', () => {
        it('should initialize dynamoBDDocClient', () => {
            expect(DynamoDBConnector.getInstance).toHaveBeenCalledTimes(1);
            expect(mockGetDocumentClient).toHaveBeenCalledTimes(1);
            expect((userRepository as any)['dynamoBDDocClient']).toBe(mockDynamoBDDocClient);
        });
    });

    describe('save', () => {
        const mockUser: Omit<User, 'id'> = {
            clientId: 'client123',
            name: 'Test User',
            videos: [] as Video[], // Explicitly type as Video[]
        };

        it('should save a new user and return the user with generated ID', async () => {
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(null);

            // Mock uuidv4 to return a predictable ID
            (require('uuid') as any).v4.mockReturnValue('mock-uuid-123');

            // Mock UserModel.fromDomain to return a UserModel instance with the generated ID
            const mockUserModelInstance = {
                id: 'mock-uuid-123',
                client_id: mockUser.clientId,
                name: mockUser.name,
                videos: [] as UserModelVideo[], // Explicitly type as UserModelVideo[]
            };
            mockFromDomain.mockReturnValue(mockUserModelInstance);

            const savedUser = await userRepository.save(mockUser);

            expect(userRepository.findByClientId).toHaveBeenCalledTimes(1);
            expect(userRepository.findByClientId).toHaveBeenCalledWith(mockUser.clientId);
            expect(mockFromDomain).toHaveBeenCalledTimes(1);
            expect(PutCommand).toHaveBeenCalledTimes(1);
            expect(PutCommand).toHaveBeenCalledWith({
                TableName: 'MockTableName',
                Item: mockUserModelInstance,
            });
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledTimes(1);
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledWith(expect.any(Object));
            expect(savedUser).toEqual({ ...mockUser, id: 'mock-uuid-123' });
        });

        it('should update an existing user and return the user with existing ID', async () => {
            const existingUser: User = { ...mockUser, id: 'existing-id', videos: [], name: 'Test User', clientId: 'client123' };
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(existingUser);

            const mockUserModelInstance = {
                id: 'existing-id',
                client_id: existingUser.clientId,
                name: existingUser.name,
                videos: [] as UserModelVideo[], // Explicitly type as UserModelVideo[]
            };
            mockFromDomain.mockReturnValue(mockUserModelInstance);

            const savedUser = await userRepository.save(mockUser);

            expect(userRepository.findByClientId).toHaveBeenCalledTimes(1);
            expect(userRepository.findByClientId).toHaveBeenCalledWith(mockUser.clientId);
            expect(mockFromDomain).toHaveBeenCalledTimes(1);
            expect(mockFromDomain).toHaveBeenCalledWith(existingUser);
            expect(PutCommand).toHaveBeenCalledTimes(1);
            expect(PutCommand).toHaveBeenCalledWith({
                TableName: 'MockTableName',
                Item: mockUserModelInstance,
            });
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledTimes(1);
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledWith(expect.any(Object));
            expect(savedUser).toEqual(existingUser);
        });

        it('should handle user found with undefined id', async () => {
            const existingUser = new User();
            existingUser.id = undefined;
            existingUser.clientId = 'client-abc';
            existingUser.name = 'Test User';
            existingUser.videos = [];

            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(existingUser);

            (require('uuid') as any).v4.mockReturnValue('mock-uuid-111');

            const mockUserModelInstance = {
                id: 'mock-uuid-111',
                client_id: mockUser.clientId,
                name: mockUser.name,
                videos: [] as UserModelVideo[],
            };
            mockFromDomain.mockReturnValue(mockUserModelInstance);

            const userToSave = { ...mockUser };
            const savedUser = await userRepository.save(userToSave);

            expect(savedUser.id).toBe('mock-uuid-111');
        });

        it('should handle undefined user found', async () => {
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(undefined);

            (require('uuid') as any).v4.mockReturnValue('mock-uuid-789');

            const mockUserModelInstance = {
                id: 'mock-uuid-789',
                client_id: mockUser.clientId,
                name: mockUser.name,
                videos: [] as UserModelVideo[],
            };
            mockFromDomain.mockReturnValue(mockUserModelInstance);

            const userToSave = { ...mockUser };
            const savedUser = await userRepository.save(userToSave);

            expect(savedUser.id).toBe('mock-uuid-789');
        });

        it('should save a new user with a undefined initial id', async () => {
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(undefined);

            (require('uuid') as any).v4.mockReturnValue('mock-uuid-456');

            const mockUserModelInstance = {
                id: 'mock-uuid-456',
                client_id: mockUser.clientId,
                name: mockUser.name,
                videos: [] as UserModelVideo[],
            };
            mockFromDomain.mockReturnValue(mockUserModelInstance);

            const userToSave = { ...mockUser };
            const savedUser = await userRepository.save(userToSave);

            expect(savedUser.id).toBe('mock-uuid-456');
        });
    });

    describe('findByClientId', () => {
        it('should return a User if found', async () => {
            const mockDbItem = {
                id: 'found-id',
                client_id: 'found-client-id',
                name: 'Found User',
                videos: [{ id: 'db-v1', name: 'DB Video', status: 'UPLOADED', url: 'http://db.com/video.mp4' }] as UserModelVideo[],
            };
            mockDynamoBDDocClientSend.mockResolvedValue({ Items: [mockDbItem] });

            const mockUserModelInstance = { id: 'found-id', client_id: 'found-client-id', name: 'Found User', videos: [] as UserModelVideo[] };
            mockFromDb.mockReturnValue(mockUserModelInstance);

            const mockUserDomainInstance: User = {
                id: 'found-id',
                clientId: 'found-client-id',
                name: 'Found User',
                videos: [] as Video[], // Explicitly type as Video[]
            };
            mockToDomain.mockReturnValue(mockUserDomainInstance);

            const foundUser = await userRepository.findByClientId('some-client-id');

            expect(QueryCommand).toHaveBeenCalledTimes(1);
            expect(QueryCommand).toHaveBeenCalledWith({
                TableName: 'MockTableName',
                IndexName: 'clientId-index',
                KeyConditionExpression: 'clientId = :clientId',
                ExpressionAttributeValues: {
                    ':clientId': 'some-client-id',
                },
                Limit: 1,
            });
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledTimes(1);
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledWith(expect.any(Object));
            expect(mockFromDb).toHaveBeenCalledTimes(1);
            expect(mockFromDb).toHaveBeenCalledWith(mockDbItem);
            expect(mockToDomain).toHaveBeenCalledTimes(1);
            expect(mockToDomain).toHaveBeenCalledWith(mockUserModelInstance);
            expect(foundUser).toEqual(mockUserDomainInstance);
        });

        it('should return null if user not found', async () => {
            mockDynamoBDDocClientSend.mockResolvedValue({ Items: [] });

            const foundUser = await userRepository.findByClientId('non-existent-client-id');

            expect(QueryCommand).toHaveBeenCalledTimes(1);
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledTimes(1);
            expect(mockFromDb).not.toHaveBeenCalled();
            expect(mockToDomain).not.toHaveBeenCalled();
            expect(foundUser).toBeNull();
        });
    });

    describe('addVideoToUser', () => {
        it('should add a video to a user and return the updated user', async () => {
            const existingUser = new User();
            existingUser.id = 'user-123';
            existingUser.clientId = 'client-abc';
            existingUser.name = 'Test User';
            existingUser.videos = [];

            const newVideo = new Video();
            newVideo.id = 'video-456';
            newVideo.name = 'New Video';
            newVideo.status = EVideoStatus.UPLOADED;
            newVideo.url = 'http://example.com/video.mp4';

            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(existingUser);

            const userModelInstance = { id: existingUser.id, client_id: existingUser.clientId, name: existingUser.name, videos: [] as UserModelVideo[] };
            mockFromDomain.mockReturnValue(userModelInstance);

            const updatedUserDomain = { ...existingUser, videos: [newVideo] };
            mockToDomain.mockReturnValue(updatedUserDomain);

            mockDynamoBDDocClientSend.mockResolvedValue({});

            const result = await userRepository.addVideoToUser('client-abc', newVideo);

            expect(userRepository.findByClientId).toHaveBeenCalledWith('client-abc');
            expect(UpdateCommand).toHaveBeenCalledWith({
                TableName: 'MockTableName',
                Key: { id: existingUser.id },
                UpdateExpression: `
              SET videos = list_append(if_not_exists(videos, :emptyList), :newVideo)
            `,
                ExpressionAttributeValues: {
                    ':newVideo': [newVideo],
                    ':emptyList': [],
                },
            });
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledWith(expect.any(Object));
            expect(mockToDomain).toHaveBeenCalledWith({ ...userModelInstance, videos: [newVideo] });
            expect(result).toEqual(updatedUserDomain);
        });

        it('should throw an error if user is not found', async () => {
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(null);

            const newVideo = new Video();
            newVideo.id = 'video-456';

            await expect(userRepository.addVideoToUser('non-existent-client', newVideo)).rejects.toThrow('User not found');

            expect(UpdateCommand).not.toHaveBeenCalled();
            expect(mockDynamoBDDocClientSend).not.toHaveBeenCalled();
        });
    });

    describe('updateVideo', () => {
        it('should update a video and return the updated video', async () => {
            const existingUser = new User();
            existingUser.id = 'user-123';
            existingUser.clientId = 'client-abc';
            existingUser.name = 'Test User';
            const originalVideo = new Video();
            originalVideo.id = 'video-456';
            originalVideo.name = 'Original Video';
            originalVideo.status = EVideoStatus.UPLOADED;
            existingUser.videos = [originalVideo];

            const updatedVideo = new Video();
            updatedVideo.id = 'video-456';
            updatedVideo.name = 'Updated Video';
            updatedVideo.status = EVideoStatus.FINISHED;

            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(existingUser);

            const userModelInstance = { ...existingUser, videos: [originalVideo] };
            mockFromDomain.mockReturnValue(userModelInstance);

            mockDynamoBDDocClientSend.mockResolvedValue({});

            const result = await userRepository.updateVideo('client-abc', updatedVideo);

            expect(userRepository.findByClientId).toHaveBeenCalledWith('client-abc');
            expect(UpdateCommand).toHaveBeenCalledWith({
                TableName: 'MockTableName',
                Key: { id: existingUser.id },
                UpdateExpression: "SET videos = :videos",
                ExpressionAttributeValues: {
                    ":videos": [updatedVideo]
                }
            });
            expect(mockDynamoBDDocClientSend).toHaveBeenCalledWith(expect.any(Object));
            expect(result).toEqual(updatedVideo);
        });

        it('should throw an error if user is not found', async () => {
            jest.spyOn(userRepository, 'findByClientId').mockResolvedValue(null);

            const updatedVideo = new Video();
            updatedVideo.id = 'video-456';

            await expect(userRepository.updateVideo('non-existent-client', updatedVideo)).rejects.toThrow('User not found');

            expect(UpdateCommand).not.toHaveBeenCalled();
            expect(mockDynamoBDDocClientSend).not.toHaveBeenCalled();
        });
    });
});
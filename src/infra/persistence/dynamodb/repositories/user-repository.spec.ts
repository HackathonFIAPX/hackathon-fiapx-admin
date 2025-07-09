import { UserRepository } from './user-repository';
import { User } from '@domain/models/User';
import { DynamoDBConnector } from '../dynamo-db-connector';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Video } from '@domain/models/Video';

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
    DynamoDBDocumentClient: {
        from: jest.fn(), // Mock this if it's used, but it's not directly in UserRepository
    },
    PutCommand: jest.fn().mockImplementation((input: any) => input), // Return input for easy assertion
    QueryCommand: jest.fn().mockImplementation((input: any) => input), // Return input for easy assertion
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
            const existingUser: User = { ...mockUser, id: 'existing-id' };
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
});
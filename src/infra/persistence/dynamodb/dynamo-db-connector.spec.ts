import { DynamoDBConnector } from './dynamo-db-connector'
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@infra/utils/logger/Logger'
import { envDynamoDB } from '@config/variables/dynamodb'

// Mock AWS SDK DynamoDBClient
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({
        send: mockSend,
    })),
    ListTablesCommand: jest.fn().mockImplementation(() => ({})),
}));

// Mock AWS SDK DynamoDBDocumentClient
jest.mock('@aws-sdk/lib-dynamodb', () => {
    const mockFrom = jest.fn(); // Define mockFrom inside the factory
    return {
        DynamoDBDocumentClient: {
            from: mockFrom,
        },
    };
});

// Mock Logger
jest.mock('@infra/utils/logger/Logger', () => ({
    Logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock envDynamoDB
jest.mock('@config/variables/dynamodb', () => ({
    envDynamoDB: {
        region: 'mock-region',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'mock-access-key',
        secretAccessKey: 'mock-secret-key',
    },
}));

describe('DynamoDBConnector', () => {
    let connector: DynamoDBConnector;

    // Get a reference to the mocked from method after the module is loaded
    // This is safe because the jest.mock factory has already run.
    const mockFrom = (DynamoDBDocumentClient as any).from; // Access the mock after the module is loaded

    beforeEach(() => {
        // Reset the singleton instance before each test
        // @ts-ignore
        DynamoDBConnector['instance'] = null;
        connector = DynamoDBConnector.getInstance() as DynamoDBConnector;

        jest.clearAllMocks();

        // Reset mock implementations for successful calls by default
        mockSend.mockResolvedValue({});
        mockFrom.mockClear(); // Clear mock for 'from'
        mockFrom.mockReturnValue({}); // Mock the document client
    });

    describe('getInstance', () => {
        it('should return a singleton instance', () => {
            const instance1 = DynamoDBConnector.getInstance();
            const instance2 = DynamoDBConnector.getInstance();
            expect(instance1).toBeInstanceOf(DynamoDBConnector);
            expect(instance1).toBe(instance2);
        });
    });

    describe('connect', () => {
        it('should connect to DynamoDB successfully', async () => {
            const connected = await connector.connect();

            expect(connected).toBe(true);
            expect(connector.isConnected()).toBe(true);
            expect(DynamoDBClient).toHaveBeenCalledTimes(1);
            expect(DynamoDBClient).toHaveBeenCalledWith({
                region: 'mock-region',
                endpoint: 'http://localhost:8000',
                credentials: {
                    accessKeyId: 'mock-access-key',
                    secretAccessKey: 'mock-secret-key',
                },
            });
            expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
            expect(ListTablesCommand).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(Logger.info).toHaveBeenCalledWith({ message: '🔌 Connecting to DynamoDB...', additionalInfo: expect.any(Object) });
            expect(Logger.info).toHaveBeenCalledWith({ message: '🔌 Initializing DynamoDB Client...' });
            expect(Logger.info).toHaveBeenCalledWith({ message: '🔌 DynamoDB Endpoint: http://localhost:8000' });
            expect(Logger.info).toHaveBeenCalledWith({ message: '✅ DynamoDB Client initialized and connected' });
            expect(Logger.error).not.toHaveBeenCalled();
        });

        it('should return true immediately if already connected', async () => {
            // First connection
            await connector.connect();
            jest.clearAllMocks(); // Clear mocks to check if connect is called again

            const connected = await connector.connect();

            expect(connected).toBe(true);
            expect(connector.isConnected()).toBe(true);
            expect(DynamoDBClient).not.toHaveBeenCalled(); // Should not call again
            expect(mockSend).not.toHaveBeenCalled(); // Should not call again
            expect(Logger.info).not.toHaveBeenCalled(); // Should not log again
            expect(Logger.error).not.toHaveBeenCalled();
        });

        it('should handle connection failure during ListTablesCommand send', async () => {
            const mockError = new Error('Network error');
            mockSend.mockRejectedValue(mockError);

            const connected = await connector.connect();

            expect(connected).toBe(false);
            expect(connector.isConnected()).toBe(false);
            expect(DynamoDBClient).toHaveBeenCalledTimes(1);
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(Logger.error).toHaveBeenCalledTimes(1);
            expect(Logger.error).toHaveBeenCalledWith({
                message: '❌ DynamoDB connection/initialization error:',
                additionalInfo: mockError,
            });
        });

        it('should handle connection failure during DynamoDBClient initialization', async () => {
            // Simulate an error during client construction
            (DynamoDBClient as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Client init error');
            });

            const connected = await connector.connect();

            expect(connected).toBe(false);
            expect(connector.isConnected()).toBe(false);
            expect(DynamoDBClient).toHaveBeenCalledTimes(1);
            expect(mockSend).not.toHaveBeenCalled(); // Should not reach send
            expect(Logger.error).toHaveBeenCalledTimes(1);
            expect(Logger.error).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: '❌ DynamoDB connection/initialization error:',
                    additionalInfo: expect.any(Error),
                }),
            );
        });

        it('should connect without endpoint and credentials if not provided in envDynamoDB', async () => {
            // Temporarily modify envDynamoDB mock
            (envDynamoDB as any).endpoint = undefined;
            (envDynamoDB as any).accessKeyId = undefined;
            (envDynamoDB as any).secretAccessKey = undefined;

            const connected = await connector.connect();

            expect(connected).toBe(true);
            expect(DynamoDBClient).toHaveBeenCalledWith({
                region: 'mock-region',
            });
            expect(Logger.info).toHaveBeenCalledWith({ message: '🔌 DynamoDB Endpoint: AWS Cloud' });
        });
    });

    describe('getDocumentClient', () => {
        it('should return the document client if connected', async () => {
            await connector.connect();
            const docClient = connector.getDocumentClient();
            expect(docClient).toBeDefined();
            expect(mockFrom).toHaveBeenCalledTimes(1);
        });

        it('should throw error if not connected', () => {
            expect(() => connector.getDocumentClient()).toThrow(
                "DynamoDB client not initialized. Call connect() first.",
            );
        });
    });

    describe('isConnected', () => {
        it('should return true if connected', async () => {
            await connector.connect();
            expect(connector.isConnected()).toBe(true);
        });

        it('should return false if not connected', () => {
            expect(connector.isConnected()).toBe(false);
        });
    });

    describe('disconnect', () => {
        it('should disconnect successfully if connected', async () => {
            await connector.connect(); // Ensure connected state
            jest.clearAllMocks();

            const disconnected = await connector.disconnect();

            expect(disconnected).toBe(true);
            expect(connector.isConnected()).toBe(false);
            expect(Logger.info).toHaveBeenCalledTimes(1);
            expect(Logger.info).toHaveBeenCalledWith({ message: '🔌 DynamoDB Client considered disconnected' });
            expect(Logger.error).not.toHaveBeenCalled();
        });

        it('should return true immediately if already disconnected', async () => {
            const disconnected = await connector.disconnect(); // Already disconnected state

            expect(disconnected).toBe(true);
            expect(connector.isConnected()).toBe(false);
            expect(Logger.info).not.toHaveBeenCalled(); // Should not log again
            expect(Logger.error).not.toHaveBeenCalled();
        });

        it('should handle disconnection error', async () => {
            // Simulate an error during disconnection (e.g., if there was actual cleanup logic)
            // For this simple disconnect, we'll mock the try-catch to simulate an error
            // This might require mocking the internal implementation of disconnect if it had more logic.
            // Since it's just setting a flag, we'll have to be creative.
            // Let's temporarily mock the isConnectedFlag setter to throw.
            Object.defineProperty(connector, 'isConnectedFlag', {
                set: jest.fn(() => { throw new Error('Simulated disconnect error'); }),
                get: jest.fn(() => true), // Ensure it's considered connected initially
            });

            const disconnected = await connector.disconnect();

            expect(disconnected).toBe(false);
            expect(Logger.error).toHaveBeenCalledTimes(1);
            expect(Logger.error).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: '❌ DynamoDB disconnection error:',
                    additionalInfo: expect.any(Error),
                }),
            );
        });
    });
});

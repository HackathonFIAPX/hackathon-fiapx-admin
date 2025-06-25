import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { IDataBaseConnector } from "../IDataBaseConnector";
import { Logger } from "@infra/utils/logger/Logger";
import { envDynamoDB } from "@config/variables/dynamodn";

export class DynamoDBConnector implements IDataBaseConnector {
    private static instance: DynamoDBConnector;
    private dbClient: DynamoDBClient;
    private docClient: DynamoDBDocumentClient; // Opcional, mas útil para operações
    private isConnectedFlag: boolean = false; // Indica se o cliente foi inicializado com sucesso

    private constructor() {}

    public static getInstance(): IDataBaseConnector {
        if (!DynamoDBConnector.instance) {
            DynamoDBConnector.instance = new DynamoDBConnector();
        }
        return DynamoDBConnector.instance;
    }

    public async connect(): Promise<boolean> {
        if (this.isConnectedFlag) return true;

        try {
            const { region, host, accessKeyId, secretAccessKey } = envDynamoDB;
            const endpoint = `${host}`;

            const clientConfig = {
                region: region,
                ...(endpoint && { endpoint }),
                ...(accessKeyId && secretAccessKey && {
                    credentials: {
                        accessKeyId: accessKeyId,
                        secretAccessKey: secretAccessKey,
                    }
                })
            };

            Logger.info({
                message: '🔌 Connecting to DynamoDB...',
                additionalInfo: {
                    clientConfig
                }
            })

            Logger.info({
                message: '🔌 Initializing DynamoDB Client...'
            });
            Logger.info({
                message: `🔌 DynamoDB Endpoint: ${endpoint || 'AWS Cloud'}`
            });

            this.dbClient = new DynamoDBClient(clientConfig);
            this.docClient = DynamoDBDocumentClient.from(this.dbClient);

            const command = new ListTablesCommand({});
            await this.dbClient.send(command);

            this.isConnectedFlag = true;
            Logger.info({ message: '✅ DynamoDB Client initialized and connected' });
            return true;

        } catch (error: any) {
            Logger.error({ message: '❌ DynamoDB connection/initialization error:', additionalInfo: error });
            this.isConnectedFlag = false;
            return false;
        }
    }

    public getDocumentClient(): DynamoDBDocumentClient {
        if (!this.isConnectedFlag || !this.docClient) {
            throw new Error("DynamoDB client not initialized. Call connect() first.");
        }
        return this.docClient;
    }

    public isConnected(): boolean {
        return this.isConnectedFlag;
    }

    public async disconnect(): Promise<boolean> {
        if (!this.isConnectedFlag) return true;
        try {
            this.isConnectedFlag = false;
            Logger.info({ message: '🔌 DynamoDB Client considered disconnected'});
            return true;
        } catch (error) {
            Logger.error({
                message: '❌ DynamoDB disconnection error:',
                additionalInfo: error
            });
            return false;
        }
    }
}
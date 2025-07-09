import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

export interface IDataBaseConnector {
    connect(): Promise<boolean>
    isConnected(): boolean
    disconnect(): Promise<boolean>
    getDocumentClient(): DynamoDBDocumentClient // Replace 'any' with the actual type if known
}
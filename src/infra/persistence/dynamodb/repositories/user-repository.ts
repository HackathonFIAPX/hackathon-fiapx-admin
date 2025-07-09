import { User } from "@domain/models/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { DynamoDBConnector } from "../dynamo-db-connector";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { envDynamoDB } from "@config/variables/dynamodb";
import { UserModel } from "../models/user.model";

export class UserRepository implements IUserRepository {
    private dynamoBDDocClient: DynamoDBDocumentClient

    constructor() {
        this.dynamoBDDocClient = DynamoDBConnector.getInstance().getDocumentClient();
    }

    async save(user: Omit<User, 'id'>): Promise<User> {
        let userId = null;
        
        const userFound = await this.findByClientId(user.clientId);
        if (userFound) {
            userId = userFound.id;
        }

        const userToSave: User = { ...user, id: userId || undefined };
        const model = UserModel.fromDomain(userToSave);
        userToSave.id = model.id; // Ensure the id is set after conversion

        const command = new PutCommand({
            TableName: envDynamoDB.tableName,
            Item: model
        });

        await this.dynamoBDDocClient.send(command);

        return userToSave;
    }

    async findByClientId(clientId: string): Promise<User | null> {
        const command = new QueryCommand({
            TableName: envDynamoDB.tableName,
            IndexName: "clientId-index", // Assuming you have a GSI for clientId
            KeyConditionExpression: "clientId = :clientId",
            ExpressionAttributeValues: {
                ":clientId": clientId
            },
            Limit: 1
        });

        const response = await this.dynamoBDDocClient.send(command);

        if (!response.Items || response.Items.length === 0) return null;
        
        const model = UserModel.fromDb(response.Items[0]);
    
        return UserModel.toDomain(model);
    }
}
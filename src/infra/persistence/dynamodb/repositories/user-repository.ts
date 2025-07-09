import { User } from "@domain/models/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { DynamoDBConnector } from "../dynamo-db-connector";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { envDynamoDB } from "@config/variables/dynamodb";
import { UserModel } from "../models/user.model";
import { Video } from "@domain/models/Video";
import { Logger } from "@infra/utils/logger/Logger";

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
            IndexName: "client_id-index", // Assuming you have a GSI for client_id
            KeyConditionExpression: "client_id = :client_id",
            ExpressionAttributeValues: {
                ":client_id": clientId
            },
            Limit: 1
        });

        const response = await this.dynamoBDDocClient.send(command);

        if (!response.Items || response.Items.length === 0) return null;
        
        Logger.info({
            message: 'User found by clientId',
            additionalInfo: {
                clientId: clientId,
                user: response.Items[0],
                response: response
            }
        })
        const model = UserModel.fromDb(response.Items[0]);
    
        return UserModel.toDomain(model);
    }

    async addVideoToUser(clientId: string, video: Video): Promise<User> {
        const userFound = await this.findByClientId(clientId);
        if (!userFound) {
            throw new Error('User not found');
        }

        const model = UserModel.fromDomain(userFound);

        Logger.info({
            message: 'Adding video to user',
            additionalInfo: {
                user: model,
                video: video
            }
        });

        const command = new UpdateCommand({
            TableName: envDynamoDB.tableName,
            Key: { id: model.id },
            UpdateExpression: `
              SET videos = list_append(if_not_exists(videos, :emptyList), :newVideo)
            `,
            ExpressionAttributeValues: {
              ":newVideo": [JSON.parse(JSON.stringify(video))],
              ":emptyList": []
            }
        });

        await this.dynamoBDDocClient.send(command);
        model.videos.push(video);
        return UserModel.toDomain(model);
    }

    async updateVideo(clientId: string, updatedVideo: Video): Promise<Video> {
        const userFound = await this.findByClientId(clientId);
        if (!userFound) {
            throw new Error('User not found');
        }

        const user = UserModel.fromDomain(userFound);

        const updatedVideos = user.videos.map(video =>
            video.id === updatedVideo.id ? updatedVideo : video
        );

        const command = new UpdateCommand({
            TableName: envDynamoDB.tableName,
            Key: { id: user.id },
            UpdateExpression: "SET videos = :videos",
            ExpressionAttributeValues: {
                ":videos": JSON.parse(JSON.stringify(updatedVideos))
            }
        });
    
        await this.dynamoBDDocClient.send(command);
        return updatedVideo;
    }
}
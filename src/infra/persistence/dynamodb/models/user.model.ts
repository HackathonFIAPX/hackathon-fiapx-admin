import { User } from "@domain/models/User";
import { VideoModel } from "./video.model";
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
    id: string;
    client_id: string;
    name: string;
    videos: { id: string; name: string; status: string; url: string }[];

    static fromDomain(user: User): UserModel {
        const userModel = new UserModel();
        userModel.id = user.id || uuidv4();
        userModel.client_id = user.clientId;
        userModel.name = user.name;
        userModel.videos = user.videos.map(video => VideoModel.fromDomain(video));
        return userModel;
    }

    static fromDb(item: Record<string, any>): UserModel {
        const model = new UserModel();
        model.id = item.id;
        model.client_id = item.client_id;
        model.name = item.name;
        model.videos = item.videos;
        return model;
      }

    static toDomain(userModel: UserModel): User {
        const user = new User();
        user.id = userModel.id;
        user.clientId = userModel.client_id;
        user.name = userModel.name;
        user.videos = userModel.videos.map(video => VideoModel.toDomain(video));
        return user;
    }
}
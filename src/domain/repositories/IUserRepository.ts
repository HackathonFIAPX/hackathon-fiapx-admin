import { User } from "@domain/models/User";
import { Video } from "@domain/models/Video";

export interface IUserRepository {
    save(user: Omit<User, 'id'>): Promise<User>;
    findByClientId(clientId: string): Promise<User | null>;
    addVideoToUser(clientId: string, video: Video): Promise<User>;
}
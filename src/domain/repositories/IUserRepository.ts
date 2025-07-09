import { User } from "@domain/models/User";

export interface IUserRepository {
    save(user: Omit<User, 'id'>): Promise<User>;
    findByClientId(clientId: string): Promise<User | null>;
}
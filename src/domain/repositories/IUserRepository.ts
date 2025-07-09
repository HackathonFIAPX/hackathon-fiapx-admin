import { User } from "@domain/models/User";

export interface IUserRepository {
    save(user: User): Promise<User>;
    findByClientId(clientId: string): Promise<User | null>;
}
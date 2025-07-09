import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserRepository } from "@infra/persistence/dynamodb/repositories/user-repository";
import { container } from "tsyringe";

container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
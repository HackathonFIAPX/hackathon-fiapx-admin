import { inject, injectable } from "tsyringe";
import { ICreateUserUseCase } from "./ICreateUserUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { TCreateUserUseCaseInput, TCreateUserUseCaseOutput } from "./TCreateUserUseCase";

@injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
    constructor(
        @inject("IUserRepository")
        private userRepository: IUserRepository
    ) {}

    async execute(input: TCreateUserUseCaseInput): Promise<TCreateUserUseCaseOutput> {
        const existingUser = await this.userRepository.findByClientId(input.clientId);
        if (existingUser) {
            throw new Error(`User with clientId ${input.clientId} already exists.`);
        }

        const newUser = {
            clientId: input.clientId,
            name: input.name,
            videos: [] as any,
        };

        const createdUser = await this.userRepository.save(newUser);
        return createdUser;
    }
}
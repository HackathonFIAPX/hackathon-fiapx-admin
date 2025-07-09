import { inject, injectable } from "tsyringe";
import { IGetAllVideosByUserUseCase } from "./IGetAllVideosByUserUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { TGetAllVideosByUserUseCaseInput, TGetAllVideosByUserUseCaseOutput } from "./TGetAllVideosByUserUseCase";

@injectable()
export class GetAllVideosByUserUseCase implements IGetAllVideosByUserUseCase {
    constructor(
        @inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(input: TGetAllVideosByUserUseCaseInput): Promise<TGetAllVideosByUserUseCaseOutput> {
        const { clientId } = input;

        const userFound = await this.userRepository.findByClientId(clientId);
        if (!userFound) {
            throw new Error('User not found');
        }

        return userFound.videos || [];
    }
}
import { injectable } from "tsyringe";
import { IUpdateVideoUseCase } from "./IUpdateVideoUseCase";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { TUpdateVideoUseCaseInput, TUpdateVideoUseCaseOutput } from "./TUpdateVideoUseCase";

@injectable()
export class UpdateVideoUseCase implements IUpdateVideoUseCase {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async execute(input: TUpdateVideoUseCaseInput): Promise<TUpdateVideoUseCaseOutput> {
        const { clientId, videoId, status } = input;

        const user = await this.userRepository.findByClientId(clientId);
        if (!user) {
            throw new Error('User not found');
        }

        const videoToUpdate = user.videos?.find(v => v.id === videoId);
        videoToUpdate.setStatus(status);

        const updatedVideo = await this.userRepository.updateVideo(clientId, videoToUpdate);
        
        return updatedVideo;
    }
}
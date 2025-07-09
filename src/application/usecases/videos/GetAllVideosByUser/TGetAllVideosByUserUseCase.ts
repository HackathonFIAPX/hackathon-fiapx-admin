import { Video } from "@domain/models/Video";

export type TGetAllVideosByUserUseCaseInput = {
    clientId: string;
}

export type TGetAllVideosByUserUseCaseOutput = Video[];
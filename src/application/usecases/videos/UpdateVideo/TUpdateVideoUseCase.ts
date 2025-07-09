import { EVideoStatus } from "@domain/models/EVideoStatus";
import { Video } from "@domain/models/Video";

export type TUpdateVideoUseCaseInput = {
    clientId: string;
    videoId: string;
    status: EVideoStatus;
}

export type TUpdateVideoUseCaseOutput = Video;
import { Video } from "@domain/models/Video";

export class VideoModel {
    id: string;
    name: string;
    status: string;
    url: string;

    constructor(id: string, name: string, status: string, url: string) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.url = url;
    }

    static fromDomain(video: Video): VideoModel {
        return new VideoModel(video.id, video.name, video.status, video.url);
    }

    static toDomain(videoModel: VideoModel): Video {
        const video = new Video();
        video.id = videoModel.id;
        video.name = videoModel.name;
        video.status = videoModel.status as any; // Assuming status is an enum, cast it accordingly
        video.url = videoModel.url;
        return video;
    }
}
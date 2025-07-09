import { EVideoStatus } from "./EVideoStatus";

export class Video {
    id: string;
    name: string;
    status: EVideoStatus;
    url: string;

    setStatus(status: EVideoStatus): void {
        const availableChanges: { [K in EVideoStatus]: EVideoStatus[] } = {
            UPLOAD_PENDING: [EVideoStatus.UPLOADED],
            UPLOADED: [EVideoStatus.CONVERTING_TO_FPS],
            CONVERTING_TO_FPS: [EVideoStatus.FINISHED],
            FINISHED: [],
        };

        if (availableChanges[this.status].includes(status)) {
            this.status = status;
        } else {
            throw new Error(`Cannot change status from ${this.status} to ${status}`);
        }
    }
}
import { TGetPresignedUrlParams, TGetPresignedUrlResponse } from "./TS3Handler";

export interface IS3Handler {
    getPresignedUrl (input: TGetPresignedUrlParams): Promise<TGetPresignedUrlResponse>
}
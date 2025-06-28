export type TUploadType = 'video'

export type TAvailableVideoUploadFileType = 'mp4'

export type TGetPresignedUrlParams = {
    expiresIn?: number
    uploadType: TUploadType
    fileName: string
    fileType: TAvailableVideoUploadFileType
    contentLength: number
}

export type TGetPresignedUrlResponse = {
    url: string
    key: string
}

export interface IS3Handler {
    getPresignedUrl (input: TGetPresignedUrlParams): Promise<TGetPresignedUrlResponse>
}
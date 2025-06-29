export type TUploadType = 'video'

export type TVideoUploadFileType = 'mp4'

export type TGetPresignedUrlParams = {
    expiresIn?: number
    uploadType: TUploadType
    fileName: string
    fileType: TVideoUploadFileType
    contentLength: number
}

export type TGetPresignedUrlResponse = {
    url: string
    key: string
}

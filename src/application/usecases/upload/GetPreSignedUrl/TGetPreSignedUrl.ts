type TAvailableFileType = 'mp4'

export type TGetPreSignedUrlInput = {
    userId: string
    fileType: TAvailableFileType
    contentLength: number
}

export type TGetPreSignedUrlOutput = {
    url: string
    key: string
}
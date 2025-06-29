type TAvailableFileType = 'mp4'

export type TGetPreSignedUrlUseCaseInput = {
    userId?: string
    fileType: TAvailableFileType
    contentLength: number
}

export type TGetPreSignedUrlUseCaseOutput = {
    url: string
    key: string
}
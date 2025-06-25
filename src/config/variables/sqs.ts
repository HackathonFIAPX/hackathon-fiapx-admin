import env from 'env-var'

export const envSQS = Object.freeze({
    region: 'us-west-2',
    accessKeyId: env.get('AWS_ACCESS_KEY_ID').asString(),
    secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').asString(),
    awsSessionToken: env.get('AWS_SESSION_TOKEN').asString(),
})
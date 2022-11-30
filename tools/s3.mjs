import './env.mjs';
import { S3 } from '@aws-sdk/client-s3';
import { env } from '../src/env/server.mjs';

const s3 = new S3({
    endpoint: env.S3_ENDPOINT,
    region: 'eu2',
    forcePathStyle: true,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
});

const main = async () => {
    await s3.createBucket({ Bucket: env.S3_BUCKET_NAME });
};

main();
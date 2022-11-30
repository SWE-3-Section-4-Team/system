import { env } from "../../env/server.mjs";
import { s3 } from '.';

export const uploadFile = (id: string, file: Buffer) => s3.putObject({
    Body: file,
    Bucket: env.S3_BUCKET_NAME,
    Key: id,
});

import { registerAs } from '@nestjs/config';
import { FileDriver } from './file-config.type';

export default registerAs('file', () => ({
  driver: FileDriver.S3,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
  awsS3Region: process.env.AWS_S3_REGION,
  maxFileSize: process.env.MAX_FILE_SIZE,
}));

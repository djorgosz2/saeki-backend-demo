export enum FileDriver {
  // LOCAL for dev
  // LOCAL = 'local',
  S3 = 's3',
}

export type FileConfig = {
  driver: FileDriver;
  accessKeyId?: string;
  secretAccessKey?: string;
  awsDefaultS3Bucket?: string;
  awsS3Region?: string;
  maxFileSize: number;
};

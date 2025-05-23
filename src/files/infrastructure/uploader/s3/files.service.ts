import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class FilesS3Service {
  create(file: Express.Multer.File) {
    if (!file) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { file: 'selectFile' },
      });
    }
    return { id: file.filename };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { FilesS3Service } from './files.service';
import { UnprocessableEntityException } from '@nestjs/common';

describe('FilesS3Service', () => {
  let service: FilesS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesS3Service],
    }).compile();

    service = module.get<FilesS3Service>(FilesS3Service);
  });

  describe('create', () => {
    it('should successfully create a file record', async () => {
      const mockFile = {
        filename: 'test-file-123.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1234,
      } as Express.Multer.File;

      const result = await service.create(mockFile);

      expect(result).toEqual({ id: 'test-file-123.txt' });
    });

    it('should throw UnprocessableEntityException when no file is provided', async () => {
      await expect(service.create(null as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException with correct error structure', async () => {
      try {
        await service.create(null as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.response).toEqual({
          status: 422,
          errors: {
            file: 'selectFile',
          },
        });
      }
    });
  });
});

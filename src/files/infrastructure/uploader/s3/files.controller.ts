import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesS3Service } from './files.service';
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard';

@Controller({
  path: 'files',
})
export class FilesS3Controller {
  constructor(private readonly filesService: FilesS3Service) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ id: string }> {
    return await this.filesService.create(file);
  }
}

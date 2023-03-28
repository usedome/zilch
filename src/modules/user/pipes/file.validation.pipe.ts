import { Injectable, PipeTransform, HttpStatus } from '@nestjs/common';
import { throwException } from 'src/utilities';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(file: any) {
    console.log(file);
    if (!file) return undefined;

    const types = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!types.includes(file?.mimetype?.toLowerCase()))
      throwException(
        HttpStatus.BAD_REQUEST,
        'file-002',
        'avatar has invalid file type',
      );

    if (file.size > 7000000)
      throwException(
        HttpStatus.BAD_REQUEST,
        'file-001',
        'avatar is larger than 7MB',
      );

    return file;
  }
}

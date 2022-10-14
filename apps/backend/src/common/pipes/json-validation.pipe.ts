import { Injectable, FileValidator } from '@nestjs/common';
import { resolve } from 'path';
import { fromBuffer } from 'file-type';

type MFile = Express.Multer.File;

@Injectable()
export class JsonValidationPipe extends FileValidator {
  private errors: Record<string, any>;

  constructor(validationOptions: Record<string, any>) {
    super(validationOptions);
  }

  async isValid(files?: MFile | MFile[]): Promise<boolean> {
    const callback = async (file: MFile) => {
      const type = await fromBuffer(file.buffer);
      const error: { extension?: string; maxSize?: string } = {};
      if (!['application/json'].includes(type?.mime ?? '')) {
        error.extension = `Unsupported file type: ${type?.ext}`;
      }
    };
    if (!files) return true;

    if (Array.isArray(files)) {
      this.errors = {};
      await Promise.all(files.map(callback));
    } else {
      this.errors = {};
      await callback(files);
    }
    if (Object.keys(this.errors).length !== 0) return false;
    return true;
  }

  buildErrorMessage(): string {
    return JSON.stringify(this.errors);
  }
}

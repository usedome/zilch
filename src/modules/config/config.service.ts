import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private envConfig: { [key: string]: string };

  constructor() {
    const envFile =
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development';
    const envPath = path.resolve(__dirname, '../../../', envFile);
    this.envConfig = dotenv.parse(fs.readFileSync(envPath));
  }

  get(key: string) {
    return this.envConfig[key];
  }

  getAll() {
    return this.envConfig;
  }
}

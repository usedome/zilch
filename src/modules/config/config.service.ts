import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private envConfig: { [key: string]: string };

  constructor() {
    const envPath = path.resolve(__dirname, '../../../', '.env');
    this.envConfig = dotenv.parse(fs.readFileSync(envPath));
  }

  get(key: string) {
    return this.envConfig[key];
  }

  getAll() {
    return this.envConfig;
  }
}

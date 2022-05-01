import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generate(sub: string) {
    const payload = { sub };
    return this.jwtService.sign(payload);
  }
}

import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { throwException } from 'src/utilities';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';

@Injectable()
export class GoogleAccountStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    configService: ConfigService,
    private userService: UserService,
    @Inject(REQUEST) private request: Request,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CLIENT_REDIRECT'),
      scope: ['email', 'profile'],
    });
  }

  authenticate(req: Request, options: any) {
    const { query } = req;

    if (query?.state) {
      options.state = query.state;
    }

    super.authenticate(req, options);
  }

  async validate(_: string, __: string, profile: any, verify: VerifyCallback) {
    const { query } = this.request;
    const { name: profileName, emails, photos } = profile;
    const first_name = profileName.givenName;
    const last_name = profileName.familyName;
    const email = emails[0].value;

    if (query?.state) return verify(null, { email });

    const avatar = photos[0].value;
    const user = await this.userService.firstOrCreate(email, {
      first_name,
      last_name,
      avatar,
      auth_type: 'GOOGLE',
    });

    if (user.auth_type !== 'GOOGLE')
      throwException(
        HttpStatus.BAD_REQUEST,
        'user-002',
        'google authentication is not enabled for this user',
      );

    verify(null, user);
  }
}

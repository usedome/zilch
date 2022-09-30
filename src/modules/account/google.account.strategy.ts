import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';

@Injectable()
export class GoogleAccountStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(configService: ConfigService, private userService: UserService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CLIENT_REDIRECT'),
      scope: ['email', 'profile'],
    });
  }

  async validate(_: string, __: string, profile: any, verify: VerifyCallback) {
    const { name: profileName, emails, photos } = profile;
    const first_name = profileName.givenName;
    const last_name = profileName.familyName;
    const email = emails[0].value;
    const avatar = photos[0].value;
    const user = await this.userService.firstOrCreate(email, {
      first_name,
      last_name,
      avatar,
      auth_type: 'GMAIL',
    });
    verify(null, user);
  }
}

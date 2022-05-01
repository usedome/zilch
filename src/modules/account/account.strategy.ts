import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AccountStrategy extends PassportStrategy(Strategy, 'google') {
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
    const name = profileName.givenName + ' ' + profileName.familyName;
    const email = emails[0].value;
    const avatar = photos[0].value;
    const user = await this.userService.firstOrCreate(email, { name, avatar });
    verify(null, user);
  }
}

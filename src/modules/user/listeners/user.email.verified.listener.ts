import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserEmailVerifiedEvent } from '../events';

@Injectable()
export class UserEmailVerifiedListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.email.verified')
  async handleUserEmailVerifiedListener(event: UserEmailVerifiedEvent) {
    await this.mailService.handleUserEmailVerifiedEvent(event.user);
  }
}

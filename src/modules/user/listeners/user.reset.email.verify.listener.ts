import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserResetEmailVerifyEvent } from '../events';

@Injectable()
export class UserResetEmailVerifyListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.reset.email.verify')
  async handleUserResetEmailListener(event: UserResetEmailVerifyEvent) {
    await this.mailService.handleUserResetEmailVerifyEvent(
      event.user,
      event.email,
    );
  }
}

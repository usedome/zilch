import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserResetEmailEvent } from '../events';

@Injectable()
export class UserResetEmailListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.reset.email')
  async handleUserResetEmailListener(event: UserResetEmailEvent) {
    await this.mailService.handleUserResetEmailEvent(event.user);
  }
}

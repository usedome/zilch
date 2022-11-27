import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserConfirmEmailEvent } from '../events';

@Injectable()
export class UserConfirmEmailListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.confirm.email')
  async handleUserConfirmEmailListener(event: UserConfirmEmailEvent) {
    await this.mailService.handleUserConfirmEmailEvent(event.user);
  }
}

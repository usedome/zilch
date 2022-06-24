import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserEmailChangedEvent } from '../events';

@Injectable()
export class UserEmailChangedListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.email.changed')
  async handleUserEmailChangedListener(event: UserEmailChangedEvent) {
    await this.mailService.handleUserEmailChangedEvent(event.user);
  }
}

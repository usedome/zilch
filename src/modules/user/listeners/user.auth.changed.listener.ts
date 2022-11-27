import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserAuthChangedEvent } from '../events';

@Injectable()
export class UserAuthChangedListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.auth.changed')
  async handleUserAuthChangedListener(event: UserAuthChangedEvent) {
    await this.mailService.handleUserAuthChangeEvent(event.user);
  }
}

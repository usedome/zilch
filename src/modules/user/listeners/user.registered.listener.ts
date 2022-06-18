import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserRegisteredEvent } from '../events';

@Injectable()
export class UserRegisteredListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.registered')
  async handleUserRegisteredEventListener(event: UserRegisteredEvent) {
    await this.mailService.handleUserRegisteredEvent(event.user);
  }
}

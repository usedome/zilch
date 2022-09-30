import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserRegisteredGoogleEvent } from '../events';

@Injectable()
export class UserRegisteredGoogleListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.registered.google')
  async handleUserRegisteredGoogleListener(event: UserRegisteredGoogleEvent) {
    await this.mailService.handleUserRegisteredGoogleEvent(event.user);
  }
}

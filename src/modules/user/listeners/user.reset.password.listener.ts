import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/modules/mail/mail.service';
import { UserResetPasswordEvent } from '../events';

@Injectable()
export class UserResetPasswordListener {
  constructor(private mailService: MailService) {}

  @OnEvent('user.reset.password')
  async handleUserResetPasswordEventListener(event: UserResetPasswordEvent) {
    await this.mailService.handleUserResetPasswordEvent(event.user);
  }
}

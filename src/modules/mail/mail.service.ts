import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import { default as formData } from 'form-data';
import * as path from 'path';
import { renderFile } from 'ejs';
import { ConfigService } from '../config/config.service';
import { User } from '../user/user.schema';

@Injectable()
export class MailService {
  private mailClient;

  constructor(private configService: ConfigService) {
    const mailgun = new Mailgun(formData);
    this.mailClient = mailgun.client({
      username: 'api',
      key: this.configService.get('MAILGUN_API_KEY'),
    });
  }

  async handleUserRegisteredEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Verify Your Email',
    };
    await this.mail(mailParams, 'user.registered.ejs', { user });
  }

  async handleUserResetPasswordEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Reset Your Password',
    };
    await this.mail(mailParams, 'user.reset.password.ejs', { user });
  }

  async handleUserResetEmailEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Reset Your Email',
    };
    await this.mail(mailParams, 'user.reset.email.ejs', { user });
  }

  async handleUserResetEmailVerifyEvent(user: User, email: string) {
    const mailParams = {
      to: email,
      subject: 'Dome: Verify Your Email',
    };
    await this.mail(mailParams, 'user.reset.email.verify.ejs', { user, email });
  }

  async handleUserEmailChangedEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Email Changed Successfully',
    };
    await this.mail(mailParams, 'user.email.changed.ejs', { user });
  }

  async mail(
    mailParams: { [key: string]: string },
    template: string,
    templateParams: { [key: string]: any },
  ) {
    const templatePath = this.generateTemplatePath(template);
    const params = this.generateTemplateParams(templateParams);
    renderFile(templatePath, params, async (error, html) => {
      if (error) throw error;
      mailParams.from = this.configService.get('MAIL_FROM');
      mailParams.html = html;
      await this.mailClient.messages.create(
        this.configService.get('MAIL_DOMAIN'),
        mailParams,
      );
    });
  }

  generateTemplatePath(template: string) {
    return path.join('src', 'utilities', 'templates', 'mail', template);
  }

  generateTemplateParams(params: { [key: string]: any }) {
    const appName = this.configService.get('APP_NAME');
    const clientUrl = this.configService.get('CLIENT_URL');
    return { appName, clientUrl, ...params };
  }
}

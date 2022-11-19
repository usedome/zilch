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
      subject: `Dome: Welcome ${user.first_name}!`,
    };
    await this.mail(mailParams, 'user.registered.ejs', { user });
  }

  async handleUserRegisteredGoogleEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: `Dome: Welcome ${user.first_name}!`,
    };
    await this.mail(mailParams, 'user.registered.google.ejs', { user });
  }

  async handleUserEmailVerifiedEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Email Verified Successfully',
    };
    await this.mail(mailParams, 'user.email.verified.ejs', { user });
  }

  async handleUserResetPasswordEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Password Reset Request',
    };
    await this.mail(mailParams, 'user.reset.password.ejs', { user });
  }

  async handleUserConfirmEmailEvent(user: User) {
    if (!user?.auth_reset?.email) return;
    const mailParams = {
      to: user.auth_reset.email,
      subject: 'Dome: Confirm Your Email',
    };
    await this.mail(mailParams, 'user.confirm.email.ejs', { user });
  }

  async handleUserAuthChangeEvent(user: User) {
    const mailParams = {
      to: user.email,
      subject: 'Dome: Sign-in Method Changed',
    };
    await this.mail(mailParams, 'user.auth.changed.ejs', { user });
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
    return (process.env?.NODE_ENV ?? '').toLowerCase() === 'production'
      ? path.join(
          __dirname,
          '../../',
          'utilities',
          'templates',
          'mail',
          template,
        )
      : path.join('src', 'utilities', 'templates', 'mail', template);
  }

  generateTemplateParams(params: { [key: string]: any }) {
    const appName = this.configService.get('APP_NAME');
    const clientUrl = this.configService.get('CLIENT_URL');
    return { appName, clientUrl, ...params };
  }
}

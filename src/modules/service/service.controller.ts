import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  CreateApiKeyDto,
  CreateIpAddressDto,
  CreateServiceDto,
  UpdateNotificationDto,
  UpdateServiceDto,
} from './dto';
import { EditServicePipe, ServiceByUuidPipe } from './pipes';
import { ServiceService } from './service.service';
import { HydratedDocument } from 'mongoose';
import { Service } from './service.schema';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { BackupService } from '../backup/backup.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ResourceService } from '../resource/resource.service';
import { Request } from 'express';
import { ConfigService } from '../config/config.service';
import { throwException } from 'src/utilities';

@Controller('services')
export class ServiceController {
  constructor(
    private serviceService: ServiceService,
    private userService: UserService,
    private resourceService: ResourceService,
    private backupService: BackupService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Post()
  async create(
    @Body(EditServicePipe) dto: CreateServiceDto,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const { user } = req;
    const service = await this.serviceService.create({ ...dto }, user._id);
    await this.userService.update(user, { default_service: service._id });
    res.status(201).json({ service, message: 'service created successfully' });
  }

  @Get()
  async get(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(8), ParseIntPipe) count: number,
  ) {
    const { user } = req;
    const { services, pagination } = await this.serviceService.get(
      { user: user._id },
      page,
      count,
    );
    return { services, pagination, message: 'services fetched successfully' };
  }

  @Get('/:uuid')
  async getOne(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
  ) {
    return { service, message: 'service fetched successfully' };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Body(EditServicePipe) body: UpdateServiceDto,
  ) {
    const updatedService = await this.serviceService.update(service, body);
    return { service: updatedService, message: 'service updated successfully' };
  }

  @Delete('/:uuid')
  @HttpCode(204)
  async delete(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Req() request: Request & { user: HydratedDocument<User> },
  ) {
    const { headers, user: initialUser } = request;
    const resources = await this.resourceService.find({ service: service._id });
    const resourceIds = resources.map(({ _id }) => _id);
    const backupCount = await this.backupService.count({
      resource: { $in: resourceIds },
    });

    if (backupCount > 0) {
      try {
        const url =
          this.configService.get('DURAN_API_URL') + `/services/${service.uuid}`;
        await firstValueFrom(
          this.httpService.delete(url, {
            headers: { authorization: headers?.authorization ?? '' },
          }),
        );
        await this.backupService.deleteMany({
          resource: { $in: resourceIds },
        });
        await this.resourceService.deleteMany({ service: service._id });
      } catch (error) {
        throwException(
          HttpStatus.BAD_GATEWAY,
          'service-002',
          `there was a problem deleting the service with uuid $${service.uuid}`,
        );
      }
    }
    await service.delete();
    const user = initialUser.toJSON();
    initialUser.default_service =
      user.services.length > 0 ? String(user.services[0]._id) : undefined;
    await initialUser.save();
  }

  @Post('/:uuid/api-keys')
  async createApiKey(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Body() body: CreateApiKeyDto,
    @Res({ passthrough: true }) res,
  ) {
    const updatedService = await this.serviceService.createApiKey(
      service,
      body.name,
    );
    const apiKey =
      updatedService.auth.api_keys[updatedService.auth.api_keys.length - 1];
    res.status(201).json({ apiKey, message: 'API Key created successfully' });
  }

  @Delete('/:uuid/api-keys/:api_key_uuid')
  async deleteApiKey(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Param('api_key_uuid') api_key_uuid: string,
    @Res({ passthrough: true }) res,
  ) {
    await this.serviceService.deleteApiKey(service, api_key_uuid);
    res.status(204);
  }

  @Post('/:uuid/ips')
  async addIpAddress(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Body() body: CreateIpAddressDto,
    @Res({ passthrough: true }) res,
  ) {
    const updatedService = await this.serviceService.createIpAddress(
      service,
      body.value,
    );
    const ip =
      updatedService.ip_whitelist.ips[service.ip_whitelist.ips.length - 1];
    res.status(201).json({ ip, message: 'ip address created successfully' });
  }

  @Delete('/:uuid/ips/:ip_address_uuid')
  async deleteIpAddress(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Param('ip_address_uuid') ip_address_uuid: string,
    @Res({ passthrough: true }) res,
  ) {
    await this.serviceService.deleteIpAddress(service, ip_address_uuid);
    res.status(204);
  }

  @Put('/:uuid/notifications')
  async updateNotifications(
    @Param('uuid', ServiceByUuidPipe) service: HydratedDocument<Service>,
    @Body() body: UpdateNotificationDto,
  ) {
    const updatedService = await this.serviceService.updateNotifications(
      service,
      body,
    );
    return {
      notifications: updatedService.notifications,
      message: 'service notifications updated successfully',
    };
  }
}

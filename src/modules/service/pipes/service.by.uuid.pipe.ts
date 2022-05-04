import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { HydratedDocument } from 'mongoose';
import { capitalize, handleException, servicePlugin } from 'src/utilities';
import { Service } from '../service.schema';
import { ServiceService } from '../service.service';

@Injectable()
export class ServiceByUuidPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private request,
    private serviceService: ServiceService,
  ) {}

  async transform(uuid: string) {
    const service = await this.serviceService.findOne({
      uuid,
      user: this.request.user._id,
    });

    if (!service) {
      handleException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    if (this.request.url.toLowerCase().includes('api-keys'))
      return this.validateApiKey(service);

    return service;
  }

  validateApiKey(service: HydratedDocument<Service>) {
    const {
      body: { name },
      params: { api_key_uuid },
      method,
    } = this.request;
    const parsedName = capitalize(name);
    if (method.toLowerCase() === 'post') {
      if (
        !service.api_keys ||
        !service.api_keys.map(({ name }) => name).includes(parsedName)
      )
        return service;
      handleException(
        HttpStatus.BAD_REQUEST,
        'service-004',
        `api key with name ${name} exists for service ${service.name} already`,
      );
    }

    if (service.api_keys.map(({ uuid }) => uuid).includes(api_key_uuid))
      return service;

    handleException(
      HttpStatus.NOT_FOUND,
      'service-005',
      `api key does not exist for service ${service.name}`,
    );
  }
}

import { HttpStatus, Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { HydratedDocument } from 'mongoose';
import { capitalize, throwException } from 'src/utilities';
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
      throwException(HttpStatus.NOT_FOUND, 'service-001', 'service not found');
    }

    const url = this.request.url.toLowerCase();

    if (url.includes('api-keys')) return this.validateApiKey(service);

    if (url.includes('ips')) return this.validateIpAddress(service);

    return service;
  }

  validateApiKey(service: HydratedDocument<Service>) {
    const {
      body: { name },
      params: { api_key_uuid },
      method,
    } = this.request;
    const parsedName = capitalize(name ?? '');
    const {
      auth: { api_keys },
    } = service;

    if (method.toLowerCase() === 'post') {
      if (!api_keys.map(({ name }) => name).includes(parsedName))
        return service;
      throwException(
        HttpStatus.BAD_REQUEST,
        'service-004',
        `api key with name ${name} exists for service ${service.name} already`,
      );
    }

    if (api_keys.map(({ uuid }) => uuid).includes(api_key_uuid)) return service;

    throwException(
      HttpStatus.NOT_FOUND,
      'service-005',
      `api key does not exist for service ${service.name}`,
    );
  }

  validateIpAddress(service: HydratedDocument<Service>) {
    const {
      body: { value },
      params: { ip_address_uuid },
      method,
    } = this.request;

    const {
      ip_whitelist: { ips },
    } = service;
    if (method.toLowerCase() === 'post') {
      if (ips.map(({ value: ipValue }) => ipValue).includes(value))
        throwException(
          HttpStatus.BAD_REQUEST,
          'service-006',
          `ip address with value ${value} is already registered for service ${service.name}`,
        );
      return service;
    }

    if (ips.map(({ uuid }) => uuid).includes(ip_address_uuid)) return service;

    throwException(
      HttpStatus.NOT_FOUND,
      'service-007',
      `ip address with uuid ${ip_address_uuid} does not exist for service ${service.name}`,
    );
  }
}

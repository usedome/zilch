import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ResourceService } from 'src/modules/resource/resource.service';
import { Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import { handleException } from 'src/utilities';
import { Service } from 'src/modules/service/service.schema';

@Injectable()
export class CreateBackupMiddleware implements NestMiddleware {
  constructor(private resourceService: ResourceService) {}

  async use(req, res: Response, next: NextFunction) {
    const resource_uuid = req.params?.resource_uuid;

    const resource = await this.resourceService.findOne({
      uuid: resource_uuid,
    });

    const authorization = req.headers?.authorization;
    const [, token] = (authorization ?? '').split(' ');

    if (!authorization || !token) {
      handleException(HttpStatus.UNAUTHORIZED, 'auth-001', 'Unauthorized');
    }

    if (!resource) {
      handleException(
        HttpStatus.NOT_FOUND,
        'resource-001',
        'resource not found',
      );
    }

    if (!resource.is_active) {
      handleException(
        HttpStatus.BAD_REQUEST,
        'resource-004',
        'resource is not currently active',
      );
    }

    await resource.populate('service');
    const service = resource?.service;

    if (
      !service.api_keys ||
      !service.api_keys.map(({ key }) => key).includes(token)
    ) {
      handleException(HttpStatus.NOT_FOUND, 'auth-001', 'Unauthorized');
    }

    req.resource = resource;
    next();
  }
}

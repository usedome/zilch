import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { EditServicePipe } from './pipes';
import { ServiceByUuidPipe } from './pipes/service.by.uuid.pipe';
import { ServiceService } from './service.service';
import { HydratedDocument } from 'mongoose';
import { Service } from './service.schema';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  async create(
    @Body(EditServicePipe) dto: CreateServiceDto,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const service = await this.serviceService.create({ ...dto }, req.user._id);
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
}

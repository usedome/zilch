import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { throws } from 'assert';
import { CreateServiceDto } from './dto';
import { CreateServicePipe } from './pipes';
import { ServiceService } from './service.service';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  async create(
    @Body(CreateServicePipe) dto: CreateServiceDto,
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
}

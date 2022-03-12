import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { uuidPlugin } from 'src/utilities';
import { Resource, ResourceSchema } from './resource.schema';
import { ResourceService } from './resource.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Resource.name,
        useFactory: () => {
          const schema = ResourceSchema;
          schema.plugin(uuidPlugin);
          return schema;
        },
      },
    ]),
  ],
  providers: [ResourceService],
})
export class ResourceModule {}

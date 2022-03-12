import { Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export const uuidPlugin = (schema: Schema) => {
  schema.pre('save', function (next) {
    if (!this.uuid) {
      this.uuid = uuidV4();
    }
    next();
  });
};

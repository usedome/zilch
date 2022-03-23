import { Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { Types } from 'mongoose';

export const uuidPlugin = (schema: Schema) => {
  schema.pre('save', function (next) {
    console.log(this);
    if (!this.uuid) {
      this.uuid = uuidV4();
    }

    if (!this._id) {
      this._id = new Types.ObjectId();
    }
    next();
  });
};

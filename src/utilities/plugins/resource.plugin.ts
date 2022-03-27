import { Schema } from 'mongoose';

export const resourcePlugin = (schema: Schema) => {
  schema.post('save', async function () {
    this.populate('service');
  });
};

import { Schema } from 'mongoose';

export const resourcePlugin = (schema: Schema) => {
  schema.pre(['findOne'], async function () {
    this.populate('service');
  });

  schema.post('save', async function () {
    this.populate('service');
  });
};

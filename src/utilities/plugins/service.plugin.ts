import { Schema } from 'mongoose';

export const servicePlugin = (schema: Schema) => {
  schema.pre(['find', 'findOne'], async function () {
    await this.populate('user');
  });

  schema.post('save', async function () {
    await this.populate('user');
  });
};

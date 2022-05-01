import { Schema } from 'mongoose';

export const userPlugin = (schema: Schema) => {
  schema.pre(['findOne', 'find'], async function () {
    this.populate('services');
  });

  schema.post('save', async function () {
    this.populate('services');
  });
};

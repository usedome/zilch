import { Schema } from 'mongoose';

export const servicePlugin = (schema: Schema) => {
  schema.pre(['findOne', 'find'], async function () {
    this.populate('user');
    this.populate('resources');
  });

  schema.post('find', async function () {
    this.populate('user');
  });
};

import { Schema } from 'mongoose';

export const servicePlugin = (schema: Schema) => {
  schema.pre(['findOne', 'find'], async function () {
    // this.populate('resources');
  });

  schema.post('save', async function () {});
};

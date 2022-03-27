import { Schema } from 'mongoose';

export const backupPlugin = (schema: Schema) => {
  schema.pre('find', async function () {
    this.populate('resource');
  });

  schema.post('save', async function (backup, next) {
    backup.populate('resource');
    next();
  });
};

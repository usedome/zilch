const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  async up(db, client) {
    const services = await db.collection('services').find().toArray();

    for (const service of services) {
      if (!service?.api_keys) return;
      const { api_keys } = service;
      const auth = { is_enabled: true, api_keys };
      await db
        .collection('services')
        .updateOne(
          { _id: new ObjectId(service._id) },
          { $set: { auth }, $unset: { api_keys: '' } },
        );
    }
  },

  async down(db, client) {
    const services = await db.collection('services').find().toArray();

    for (const service of services) {
      if (!service?.auth) return;
      const {
        auth: { api_keys },
      } = service;
      await db
        .collection('services')
        .updateOne(
          { _id: new ObjectId(service._id) },
          { $set: { api_keys }, $unset: { auth: '' } },
        );
    }
  },
};

const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  async up(db, client) {
    const services = await db.collection('services').find().toArray();

    for (const service of services) {
      if (!service?.ips) return;

      const { ips } = service;
      const ip_whitelist = { is_enabled: false, ips };

      await db.collection('services').updateOne(
        { _id: new ObjectId(service._id) },
        {
          $set: { ip_whitelist },
          $unset: { ips: '' },
        },
      );
    }
  },

  async down(db, client) {
    const services = await db.collection('services').find().toArray();

    for (const service of services) {
      if (!service?.ip_whitelist) return;

      const {
        ip_whitelist: { ips },
      } = service;

      await db.collection('services').updateOne(
        { _id: new ObjectId(service._id) },
        {
          $set: { ips },
          $unset: { ip_whitelist: '' },
        },
      );
    }
  },
};

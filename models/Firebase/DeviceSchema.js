const mongoose = require('mongoose');

const DeviceInfoSchema = new mongoose.Schema({
  serialNumber: { type: String},
  tokken: { type: String }
});

const DeviceSchema = new mongoose.Schema({
  userID:{ type: Number},
  infos: [DeviceInfoSchema]
});

const Device = mongoose.model('DeviceSchema', DeviceSchema,'DeviceSchema');

module.exports = Device;
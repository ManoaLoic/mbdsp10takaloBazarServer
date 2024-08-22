const mongoose = require('mongoose');

const DeviceInfoSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  tokken: { type: String, required: true }
});

const DeviceSchema = new mongoose.Schema({
  userID:{ type: Number, required: true, unique: true },
  infos: [DeviceInfoSchema]
});

const Device = mongoose.model('DeviceSchema', DeviceSchema,'DeviceSchema');

module.exports = Device;
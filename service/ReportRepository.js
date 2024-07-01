const Report = require("../models/Report");

exports.save = async (report) => {
  try {
    return await Report.create(report);
  } catch (error) {
    throw error;
  }
};

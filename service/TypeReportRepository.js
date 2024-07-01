const TypeReport = require("../models/TypeReport");

exports.addTypeReport = async (name) => {
  try {
    return await TypeReport.create({ name });
  } catch (error) {
    throw error;
  }
};

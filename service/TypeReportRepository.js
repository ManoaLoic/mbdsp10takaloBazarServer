const TypeReport = require("../models/TypeReport");

exports.addTypeReport = async (name) => {
  try {
    return await TypeReport.create({ name });
  } catch (error) {
    throw error;
  }
};

// Modifier Type Report
exports.updateTypeReport = async (idTypeReport,name) => {
  try{
    const typeReport = await TypeReport.findByPk(idTypeReport);
      if (!typeReport) {
        throw new Error('Type Rapport Introuvable!');
      }
      typeReport.name = name;
      await typeReport.save();
      return typeReport;
  }catch(error){
    throw error;
  }
}

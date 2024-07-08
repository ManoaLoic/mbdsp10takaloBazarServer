const { Op } = require('sequelize');
const TypeReport = require("../models/TypeReport");

exports.deleteReportType = async (reportTypeId) => {
  const reportType = await TypeReport.findByPk(reportTypeId);
  if (!reportType) {
    throw new Error('ReportType not found');
  }
  await reportType.destroy();
  return reportType;
}

exports.findAll = async (q, page, limit) => {
  const offset = (page - 1) * limit;
  const where = q ? { name: { [Op.iLike]: `%${q}%` } } : {};

  const { rows, count } = await TypeReport.findAndCountAll({
    where,
    offset,
    limit,
  });

  return {
    typeReports: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
};

exports.addTypeReport = async (name) => {
  try {
    return await TypeReport.create({ name });
  } catch (error) {
    throw error;
  }
};

// Modifier Type Report
exports.updateTypeReport = async (idTypeReport, name) => {
  try {
    const typeReport = await TypeReport.findByPk(idTypeReport);
    if (!typeReport) {
      throw new Error('Type Rapport Introuvable!');
    }
    typeReport.name = name;
    await typeReport.save();
    return typeReport;
  } catch (error) {
    throw error;
  }
}

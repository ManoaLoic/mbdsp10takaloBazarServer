const TypeReportRepository = require('../service/TypeReportRepository');

exports.getAllTypeReports = async (req, res) => {
  try {
    let { page, limit, q } = req.query;
    page = page || "1";
    limit = limit || "50";

    const { typeReports, totalPages, currentPage } = await TypeReportRepository.findAll(q, parseInt(page), parseInt(limit));

    res.status(200).json({
      data: {
        typeReports,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'ERROR',
      error: error.message,
    });
  }
};

exports.addTypeReport = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }
  try {
    const newTypeReport = await TypeReportRepository.addTypeReport(name);
    return res.status(201).json(newTypeReport);
  } catch (error) {
    console.error('Erreur lors de la création du TypeReport:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Le nom existe déjà' });
    }
    return res.status(500).json({ error: 'Erreur interne du serveur :' + error.message });
  }
};

exports.updateTypeReport = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom du Type Rapport obligatoire!' });
    }
    const updatedTypeReport = await TypeReportRepository.updateTypeReport(req.params.id, name);
    res.status(200).json({
      message: "SUCCESS",
      typeReport: updatedTypeReport
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR", error: error.message });
  }
};
const ReportRepository = require('../service/ReportRepository');

exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await ReportRepository.getReportById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: 'ERROR',
      error: error.message,
    });
  }
};

exports.createReport = async (req, res) => {
  const { object_id, reason } = req.body;
  if (!object_id || !reason) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  try {
    const reporter_user_id = req.user.id;
    const newReport = await ReportRepository.save({ object_id, reporter_user_id, reason });
    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Erreur lors de la création du rapport:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur: ' + error.message });
  }
};

exports.listReportedObjects = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reportedObjects = await ReportRepository.getReportedObjects(parseInt(page), parseInt(limit));
    res.status(200).json({
      message: "SUCCESS",
      data: reportedObjects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
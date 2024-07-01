const ReportRepository = require('../service/ReportRepository');

exports.createReport = async (req, res) => {
  const { objectId, reason } = req.body;
  if (!objectId || !reason) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  try {
    const reporterUserId = 1;
    const newReport = await ReportRepository.save({ objectId, reporterUserId, reason });
    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Erreur lors de la création du rapport:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur: ' + error.message });
  }
};
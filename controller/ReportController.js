const ReportRepository = require('../service/ReportRepository');

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
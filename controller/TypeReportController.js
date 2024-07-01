const TypeReportRepository = require('../service/TypeReportRepository');

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
        return res.status(500).json({ error: 'Erreur interne du serveur :'+error.message });
      }
};
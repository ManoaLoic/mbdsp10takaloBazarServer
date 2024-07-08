const ExchangeRepository = require('../service/ExchangeRepository');

exports.getCount = async (req, res) => {
    try {
        const { status } = req.query;
        if (!status) {
            return res.status(400).json({ error: 'Status parameter is required' });
        }

        const count = await ExchangeRepository.getCountByStatus(status);

        res.status(200).json({ status, count });
    } catch (error) {
        res.status(500).json({
            message: 'ERROR',
            error: error.message,
        });
    }
};

exports.proposerExchange = async (req, res) => {
    try {
        const { prpUserId, rcvUserId, rcvObjectId, prpObjectId, note, appointmentDate, meetingPlace } = req.body;
        const exchange = await ExchangeRepository.proposerExchange(
            prpUserId,
            rcvUserId,
            rcvObjectId,
            prpObjectId,
            note,
            new Date(appointmentDate),
            meetingPlace
        );

        res.status(201).json({
            message: 'SUCCESS',
            exchange: exchange
        });
    } catch (error) {
        res.status(500).json({
            message: "ERROR",
            error: error.message
        });
    }
};

exports.acceptExchange = async (req, res) => {
    const { exchangeId } = req.params;
    const userId  = req.user.id;

    try {
        const exchange = await ExchangeRepository.acceptExchange(exchangeId, userId);
        res.status(200).json({
            message: 'Échange accepté avec succès',
            exchange: exchange
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: 'ERROR',
            error: error.message
        });
    }
};

exports.getHistoriqueExchange = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || "";

        const exchangeHistory = await ExchangeRepository.getHistoriqueExchange(userId, status, page, limit);

        res.status(200).json({
            message: 'SUCCESS',
            data: exchangeHistory
        });
    } catch (error) {
        res.status(500).json({
            message: 'ERROR',
            error: error.message
        });
    }
};

exports.rejectExchange = async (req, res) => {
    const { exchangeId } = req.params;
    const { note } = req.body;
    if (!note) {
        return res.status(400).json({ error: 'Veuillez préciser la raison du rejet de l\'échange.' });
    }

    try {
        const updatedExchange = await ExchangeRepository.rejectExchange(exchangeId, note, req.user.id);
        if (!updatedExchange) {
            return res.status(404).json({ error: 'Échange non trouvé' });
        }
        if (updatedExchange == 1) {
            return res.status(403).json({ error: 'Vous ne pouvez pas rejeter cet échange, car vous n\'êtes pas la personne associée à cet échange.' });
        }
        return res.status(200).json({ message: 'Échange rejeté avec succès', exchange: updatedExchange });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de l\'échange:', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}

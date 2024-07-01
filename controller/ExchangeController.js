const ExchangeRepository = require('../service/ExchangeRepository');

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

exports.getHistoriqueExchange = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || "";

        const exchangeHistory = await ExchangeRepository.getHistoriqueExchange(userId,status, page, limit);

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

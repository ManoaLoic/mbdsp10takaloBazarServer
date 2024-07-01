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

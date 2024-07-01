const Exchange = require("../models/Exchange");
const ExchangeObject = require("../models/ExchangeObject");
const User = require("../models/User");
const Object = require("../models/Object");
const { Op } = require('sequelize');

// Proposer Exchange
exports.proposerExchange = async (prpUserID, rcvUserId, rcvObjectId, prpObjectId, note, appointmentDate, meetingPlace) => {
    try {
        const proposerUser = await User.findByPk(prpUserID);
        const receiverUser = await User.findByPk(rcvUserId);
        const receiverObject = await Object.findAll({
            where: {
                id: rcvObjectId,
                user_id: rcvUserId
            }
        });
        const proposerObjects = await Object.findAll({
            where: {
                id: prpObjectId,
                user_id: prpUserID
            }
        });

        if (!proposerUser || !receiverUser || receiverObject.length !== rcvObjectId.length || proposerObjects.length !== prpObjectId.length) {
            throw new Error("La transaction ne peut pas être effectuée!");
        }

        const newExchange = await Exchange.create({
            proposer_user_id: prpUserID,
            receiver_user_id: rcvUserId,
            status: 'Proposed',
            note: note,
            appointment_date: appointmentDate,
            meeting_place: meetingPlace,
            created_at: new Date(),
            updated_at: new Date()
        });

        await Promise.all([
            ...receiverObject.map(rcvObjet=>
                ExchangeObject.create({
                    exchange_id: newExchange.id,
                    object_id: rcvObjet.id,
                    user_id: rcvUserId
                })
            ),
        
            ...proposerObjects.map(proposerObject => 
                ExchangeObject.create({
                    exchange_id: newExchange.id,
                    object_id: proposerObject.id,
                    user_id: prpUserID
                })
            )
        ]);
        return newExchange;
    } catch (err) {
        throw err;
    }
};

// Historique des Exchange d'un USER
exports.getHistoriqueExchange = async (userId,status, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        const conditions = {
            [Op.or]: [
                { proposer_user_id: userId },
                { receiver_user_id: userId }
            ],
            status: {
                [Op.not]: 'Proposed'
            }
        };
        if (status && status.trim() !== '') {
            conditions.status = status.trim();
        }
        const { count, rows } = await Exchange.findAndCountAll({
            where: conditions,
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset,
            include: [
                { model: User, as: 'proposer', attributes: ['id', 'username', 'first_name', 'last_name'] },
                { model: User, as: 'receiver', attributes: ['id', 'username', 'first_name', 'last_name'] }
            ],
        });

        const formattedExchanges = rows.map(exchange => ({
            id: exchange.id,
            proposer_user_id: exchange.proposer_user_id,
            proposer_user_name: `${exchange.proposer.first_name} ${exchange.proposer.last_name}`,
            receiver_user_id: exchange.receiver_user_id,
            receiver_user_name: `${exchange.receiver.first_name} ${exchange.receiver.last_name}`,
            status: exchange.status,
            note: exchange.note,
            appointment_date: exchange.appointment_date,
            meeting_place: exchange.meeting_place,
            created_at: exchange.created_at,
            updated_at: exchange.updated_at
        }));
        
        const totalPages = Math.ceil(count / limit);    

        return {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            exchanges: formattedExchanges
        };
    } catch (err) {
        throw err;
    }
};
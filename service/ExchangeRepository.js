const Exchange = require("../models/Exchange");
const ExchangeObject = require("../models/ExchangeObject");
const User = require("../models/User");
const Object = require("../models/Object");
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const DeviceSchemaRepository = require("../service/FireBaseService/DeviceService");
const Category = require("../models/Category");

exports.findExchanges = async (filters, offset, limit, orderBy = 'created_at', orderDirection = 'DESC') => {
    orderBy = orderBy || 'created_at';
    orderDirection = orderDirection || 'DESC';

    const where = {};

    if (filters.proposer_user_id) {
        where.proposer_user_id = filters.proposer_user_id;
    }

    if (filters.receiver_user_id) {
        where.receiver_user_id = filters.receiver_user_id;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.note) {
        where.note = { [Op.like]: `%${filters.note}%` };
    }

    if (filters.appointment_date_start || filters.appointment_date_end) {
        where.appointment_date = {};
        if (filters.appointment_date_start) {
            where.appointment_date[Op.gte] = filters.appointment_date_start;
        }
        if (filters.appointment_date_end) {
            where.appointment_date[Op.lte] = filters.appointment_date_end;
        }
    }

    if (filters.meeting_place) {
        where.meeting_place = { [Op.like]: `%${filters.meeting_place}%` };
    }

    if (filters.created_at_start || filters.created_at_end) {
        where.created_at = {};
        if (filters.created_at_start) {
            where.created_at[Op.gte] = filters.created_at_start;
        }
        if (filters.created_at_end) {
            where.created_at[Op.lte] = filters.created_at_end;
        }
    }

    if (filters.updated_at_start || filters.updated_at_end) {
        where.updated_at = {};
        if (filters.updated_at_start) {
            where.updated_at[Op.gte] = filters.updated_at_start;
        }
        if (filters.updated_at_end) {
            where.updated_at[Op.lte] = filters.updated_at_end;
        }
    }

    if (filters.date_start || filters.date_end) {
        where.date = {};
        if (filters.date_start) {
            where.date[Op.gte] = filters.date_start;
        }
        if (filters.date_end) {
            where.date[Op.lte] = filters.date_end;
        }
    }

    return Exchange.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'proposer',
                attributes: ['id', 'username', 'email'],
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email'],
            }
        ],
        offset,
        limit,
        order: [[orderBy, orderDirection]],
    });
}

exports.findExchangeById = async (exchangeId) => {
    try {
        return await Exchange.findByPk(exchangeId, {
            include: [
                {
                    model: User,
                    as: 'proposer',
                    attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture'],
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture'],
                },
                {
                    model: ExchangeObject,
                    as: 'exchange_objects',
                    include: {
                        model: Object,
                        as: 'object',
                        attributes: ['id', 'name', 'description', 'image'],
                        include: {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name'],
                        },
                    },
                }
            ],
        });
    } catch (error) {
        console.error('Error fetching exchange by ID:', error);
        throw error;
    }
};


exports.getTopUsersByExchanges = async (limit = 10) => {
    const query = `
        WITH total_exchanges AS (
            SELECT COUNT(*) AS total
            FROM (
                SELECT proposer_user_id FROM "Exchange"
                UNION ALL
                SELECT receiver_user_id FROM "Exchange"
            ) AS combined
        ),
        user_exchanges AS (
            SELECT user_id, username, COUNT(*) AS exchange_count
            FROM (
                SELECT proposer_user_id AS user_id FROM "Exchange"
                UNION ALL
                SELECT receiver_user_id AS user_id FROM "Exchange"
            ) AS combined
            JOIN "User" ON combined.user_id = "User".id
            GROUP BY user_id, username
        )
        SELECT user_exchanges.user_id, user_exchanges.username, user_exchanges.exchange_count,
               (user_exchanges.exchange_count::float / total_exchanges.total * 100) AS percentage
        FROM user_exchanges, total_exchanges
        ORDER BY user_exchanges.exchange_count DESC
        LIMIT :limit;
    `;

    const result = await sequelize.query(query, {
        replacements: { limit },
        type: sequelize.QueryTypes.SELECT
    });

    return result;
}


exports.getOpenExchanges = async (userId) => {
    const where = {
        status: 'Proposed',
        [Op.or]: [
            { proposer_user_id: userId },
            { receiver_user_id: userId }
        ]
    };

    return await Exchange.findAll({
        where,
        include: [
            {
                model: User,
                as: 'proposer',
                attributes: ['id', 'username', 'email'],
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email'],
            }
        ],
        order: [['created_at', 'DESC']]
    });
}

exports.getCountByStatus = async (status) => {
    try {
        const count = await Exchange.count({
            where: {
                status: status
            }
        });

        return count;
    } catch (error) {
        throw error;
    }
};

// Proposer Exchange
exports.proposerExchange = async (prpUserID, rcvUserId, rcvObjectId, prpObjectId) => {
    try {
        const proposerUser = await User.findByPk(prpUserID);
        const receiverUser = await User.findByPk(rcvUserId);

        if (!proposerUser || !receiverUser) {
            const error = new Error("L'utilisateur Proposeur ou Receveur n'existe pas.");
            error.statusCode = 404;
            throw error;
        }
        if (proposerUser.status === 'Deleted' || receiverUser.status === 'Deleted') {
            const error = new Error(`Le compte de ${proposerUser.status === 'Deleted' ? "Proposeur" : "Receveur"} n'est pas valide.`);
            error.statusCode = 400;
            throw error;
        }
        const receiverObjects = await Object.findAll({
            where: {
                id: rcvObjectId,
                user_id: rcvUserId,
                status: 'Available'
            }
        });
        const proposerObjects = await Object.findAll({
            where: {
                id: prpObjectId,
                user_id: prpUserID,
                status: 'Available'
            }
        });
        if (proposerObjects.length !== prpObjectId.length) {
            const error = new Error("Les objets proposés n'appartiennent pas au proposeur.");
            error.statusCode = 400;
            throw error;
        }
        if (receiverObjects.length !== rcvObjectId.length) {
            const error = new Error("Les objets reçus n'appartiennent pas au receveur.");
            error.statusCode = 400;
            throw error;
        }
        const newExchange = await Exchange.create({
            proposer_user_id: prpUserID,
            receiver_user_id: rcvUserId,
            status: 'Proposed',
            created_at: new Date(),
            updated_at: new Date()
        });

        await Promise.all([
            ...receiverObjects.map(rcvObject =>
                ExchangeObject.create({
                    exchange_id: newExchange.id,
                    object_id: rcvObject.id,
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
        if (newExchange) {
            await DeviceSchemaRepository.sendNotification(rcvUserId, "Proposed");
        }
        return newExchange;
    } catch (err) {
        throw err;
    }
};

isDateInFuture = (date) => {
    const today = new Date();
    const date1 = new Date(date);
    today.setHours(0, 0, 0, 0);
    date1.setHours(0, 0, 0, 0);
    return date1 > today;
}

exports.acceptExchange = async (exchangeId, userId, body) => {
    const transaction = await sequelize.transaction();

    try {
        if (!isDateInFuture(body.appointment_date)) {
            const error = new Error('La date du rendez-vous est déjà passée. Veuillez sélectionner une date dans le futur.');
            error.statusCode = 400;
            throw error;
        }

        const exchange = await Exchange.findByPk(exchangeId, { transaction });

        if (!exchange) {
            const error = new Error('Échange non trouvé');
            error.statusCode = 404;
            throw error;
        }

        if (exchange.receiver_user_id !== userId) {
            const error = new Error('Vous ne pouvez pas accepter cet échange, car vous n\'êtes pas le destinataire.');
            error.statusCode = 403;
            throw error;
        }

        exchange.status = 'Accepted';
        exchange.updated_at = new Date();
        exchange.meeting_place = body.meeting_place;
        exchange.appointment_date = body.appointment_date;
        exchange.date = new Date();
        exchange.latitude = body.latitude;
        exchange.longitude = body.longitude;
        await exchange.save({ transaction });

        const exchangeObjects = await ExchangeObject.findAll({ where: { exchange_id: exchangeId }, transaction });

        if (!exchangeObjects || exchangeObjects.length === 0) {
            const error = new Error('Objets non trouvés');
            error.statusCode = 404;
            throw error;
        }

        const proposerUserId = exchange.proposer_user_id;
        const receiverUserId = exchange.receiver_user_id;

        const proposerObjectIds = exchangeObjects
            .filter(eo => eo.user_id === proposerUserId)
            .map(eo => eo.object_id);
        const receiverObjectIds = exchangeObjects
            .filter(eo => eo.user_id === receiverUserId)
            .map(eo => eo.object_id);

        // Update the ownership of objects
        await Object.update(
            { user_id: receiverUserId },
            { where: { id: proposerObjectIds }, transaction }
        );

        await Object.update(
            { user_id: proposerUserId },
            { where: { id: receiverObjectIds }, transaction }
        );

        const allObjectIds = [...proposerObjectIds, ...receiverObjectIds];
        const exchangesToCancel = await Exchange.findAll({
            where: {
                status: 'Proposed',
                id: { [Op.ne]: exchangeId }
            },
            include: [{
                model: ExchangeObject,
                as: 'exchange_objects',
                where: {
                    object_id: { [Op.in]: allObjectIds }
                }
            }],
            transaction
        });

        const exchangeIdsToCancel = exchangesToCancel.map(e => e.id);
        if (exchangeIdsToCancel.length > 0) {
            await Exchange.update(
                {
                    status: 'Cancelled',
                    updated_at: new Date(),
                    date: new Date(),
                    note: "[Action automatique] L'un des objets a changé de propriétaire"
                },
                { where: { id: { [Op.in]: exchangeIdsToCancel } }, transaction }
            );
        }

        await transaction.commit();
        await DeviceSchemaRepository.sendNotification(proposerUserId, "Accepted");
        return exchange;
    } catch (error) {
        await transaction.rollback();
        console.error('Error accepting exchange:', error);
        throw error;
    }
};

// Historique des Exchange d'un USER
exports.getHistoriqueExchange = async (userId, status, page, limit) => {
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
            updated_at: exchange.updated_at,
            date: exchange.date
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

exports.rejectExchange = async (exchangeId, note, userId) => {
    try {
        const exchange = await Exchange.findByPk(exchangeId);
        if (!exchange) {
            return null;
        }
        if (exchange.receiver_user_id != userId) {
            return 1;
        }
        exchange.status = 'Refused';
        exchange.note = note;
        exchange.updated_at = new Date();
        exchange.date = new Date();
        await exchange.save();
        await DeviceSchemaRepository.sendNotification(exchange.proposer_user_id, "Rejected")
        return exchange;
    } catch (error) {
        console.error('Error updating exchange status:', error);
        throw error;
    }
}

// Nombre d'échange entre 2 dates
exports.getExchangesBetweenDates = async (date1, date2, status) => {
    try {
        let dateCondition = 'created_at';
        let whereConditions = {};

        if (status) {
            whereConditions.status = status;
            if (status === "proposed") {
                whereConditions.date = null;
            } else {
                dateCondition = 'date';
            }
        }

        let result = [];
        let groupingField = '';

        if (!date1 && !date2) {
            groupingField = 'year';
            result = await Exchange.findAll({
                attributes: [
                    [Sequelize.fn('date_part', 'year', Sequelize.col(dateCondition)), 'year'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
                ],
                where: whereConditions,
                group: [Sequelize.fn('date_part', 'year', Sequelize.col(dateCondition))],
                order: [[Sequelize.literal('year'), 'ASC']]
            });

            result = result.map(item => ({
                period: item.getDataValue('year').toString(),
                exchange_count: item.getDataValue('exchange_count'),
                type: 'year'
            }));
        } else {
            if (!date1 && date2) {
                const oldestExchange = await Exchange.findOne({
                    order: [[dateCondition, 'ASC']]
                });
                date1 = oldestExchange ? oldestExchange[dateCondition] : new Date();
            }

            if (date1 && !date2) {
                date2 = new Date();
            }

            date1 = new Date(date1);
            date2 = new Date(date2);

            whereConditions[dateCondition] = {
                [Op.between]: [date1, date2]
            };

            result = await Exchange.findAll({
                attributes: [
                    [Sequelize.literal(`"${dateCondition}"::date`), 'date'],
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
                ],
                where: whereConditions,
                group: [Sequelize.literal(`"${dateCondition}"::date`)],
                order: [[Sequelize.literal('date'), 'ASC']]
            });

            result = result.map(item => ({
                period: item.getDataValue('date'),
                exchange_count: item.getDataValue('exchange_count'),
                type: 'date'
            }));
        }

        return result;
    } catch (error) {
        throw error;
    }
};
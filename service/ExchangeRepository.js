const Exchange = require("../models/Exchange");
const ExchangeObject = require("../models/ExchangeObject");
const User = require("../models/User");
const Object = require("../models/Object");
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

exports.getTopUsersByExchanges = async (limit = 10) => {
    const query = `
        SELECT user_id, username, COUNT(*) AS exchange_count
        FROM (
            SELECT proposer_user_id AS user_id FROM "Exchange"
            UNION ALL
            SELECT receiver_user_id AS user_id FROM "Exchange"
        ) AS combined
        JOIN "User" ON combined.user_id = "User".id
        GROUP BY user_id, username
        ORDER BY exchange_count DESC
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
        const receiverObject = await Object.findAll({
            where: {
                id: rcvObjectId,
                user_id: rcvUserId,
                status : 'Available'
            }
        });
        const proposerObjects = await Object.findAll({
            where: {
                id: prpObjectId,
                user_id: prpUserID,
                status : 'Available'
            }
        });

        if (!proposerUser || !receiverUser || receiverObject.length !== rcvObjectId.length || proposerObjects.length !== prpObjectId.length) {
            throw new Error("La transaction ne peut pas être effectuée!");
        }

        const newExchange = await Exchange.create({
            proposer_user_id: prpUserID,
            receiver_user_id: rcvUserId,
            status: 'Proposed',
            created_at: new Date(),
            updated_at: new Date()
        });

        await Promise.all([
            ...receiverObject.map(rcvObjet =>
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

exports.acceptExchange = async (exchangeId, userId) => {
    const transaction = await sequelize.transaction();

    try {
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
        await exchange.save({ transaction });

        const exchangeObjects = await ExchangeObject.findAll({ where: { exchange_id: exchangeId }, transaction });

        if (!exchangeObjects || exchangeObjects.length === 0) {
            const error = new Error('Objets non trouvés');
            error.statusCode = 404;
            throw error;
        }

        const proposerUserId = exchange.proposer_user_id;
        const receiverUserId = exchange.receiver_user_id;

        const proposerObjects = exchangeObjects.filter(eo => eo.user_id === proposerUserId);
        const receiverObjects = exchangeObjects.filter(eo => eo.user_id === receiverUserId);

        const proposerObjectIds = proposerObjects.map(eo => eo.object_id);
        await Object.update(
            { user_id: receiverUserId },
            { where: { id: proposerObjectIds }, transaction }
        );

        const receiverObjectIds = receiverObjects.map(eo => eo.object_id);
        await Object.update(
            { user_id: proposerUserId },
            { where: { id: receiverObjectIds }, transaction }
        );

        await transaction.commit();
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
  
      if (!date1 && !date2) {
        const result = await Exchange.findAll({
          attributes: [
            [Sequelize.fn('date_part', 'year', Sequelize.col(dateCondition)), 'year'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
          ],
          where: whereConditions,
          group: ['year']
        });
        return result;
      }
  
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
      const intervalDays = (date2 - date1) / (1000 * 60 * 60 * 24);
  
      whereConditions[dateCondition] = {
        [Op.between]: [date1, date2]
      };
  
      let result;
  
      if (intervalDays <= 30) {
        result = await Exchange.findAll({
          attributes: [
            [Sequelize.literal(`date_trunc('day', "${dateCondition}")::date`), 'day'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
          ],
          where: whereConditions,
          group: ['day']
        });
      } else if (intervalDays <= 365) {
        result = await Exchange.findAll({
          attributes: [
            [Sequelize.literal(`date_trunc('month', "${dateCondition}")::date`), 'month'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
          ],
          where: whereConditions,
          group: ['month']
        });
      } else {
        result = await Exchange.findAll({
          attributes: [
            [Sequelize.literal(`date_trunc('year', "${dateCondition}")::date`), 'year'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'exchange_count']
          ],
          where: whereConditions,
          group: ['year']
        });
      }
  
      return result;
    } catch (error) {
      throw error;
    }
  };
  
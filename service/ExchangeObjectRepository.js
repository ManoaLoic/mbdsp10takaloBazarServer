const ExchangeObject = require("../models/ExchangeObject");
const Exchange = require("../models/Exchange");
const User = require("../models/User");
const Object = require("../models/Object");
const { Op } = require('sequelize');

exports.update = async (id, updateData) => {
    try {
        const [updated] = await ExchangeObject.update(updateData, {
            where: { id }
        });

        if (updated) {
            const updatedExchangeObject = await ExchangeObject.findOne({ where: { id } });
            return updatedExchangeObject;
        }

        return null;
    } catch (error) {
        throw error;
    }
};

exports.getListeExchangeObjects = async (idExchange, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        let conditions = {};
        if (idExchange) {
            conditions.exchange_id = idExchange;
        }

        const { count, rows } = await ExchangeObject.findAndCountAll({
            where: conditions,
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Exchange,
                    include: [
                        { model: User, as: 'proposer', attributes: ['id', 'username', 'first_name', 'last_name'] },
                        { model: User, as: 'receiver', attributes: ['id', 'username', 'first_name', 'last_name'] }
                    ]
                },
                { model: User, attributes: ['id', 'username', 'first_name', 'last_name'] },
                { model: Object, attributes: ['id', 'name', 'description', 'image'] }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        const formattedExchangeObjects = rows.map(exchangeObject => ({
            id: exchangeObject.id,
            exchange_id: exchangeObject.exchange_id,
            object_id: exchangeObject.object_id,
            user_id: exchangeObject.user_id,
            proposer_user_name: exchangeObject.Exchange?.proposer?.first_name + ' ' + exchangeObject.Exchange?.proposer?.last_name,
            receiver_user_name: exchangeObject.Exchange?.receiver?.first_name + ' ' + exchangeObject.Exchange?.receiver?.last_name,
            created_at: exchangeObject.created_at,
            updated_at: exchangeObject.updated_at,
            object: {
                id: exchangeObject.Object.id,
                name: exchangeObject.Object.name,
                description: exchangeObject.Object.description,
                image: exchangeObject.Object.image
            }
        }));

        return {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            exchangeObjects: formattedExchangeObjects
        };
    } catch (error) {
        throw error;
    }
};

exports.addExchangeObject = async(exchangeId, objectId, userId) => {

    const existingExchangeObject = await ExchangeObject.findOne({
        where: {
            exchange_id: exchangeId,
            object_id: objectId
        }
    });
  
    if (existingExchangeObject) {
        throw new Error('L\'objet est déjà associé à cet échange');
    }

    const user = await User.findOne({
        where: { id: userId }
      });
  
    if (!user) {
    throw new Error('Utilisateur non trouvé');
    }
    const exchange = await Exchange.findOne({
      where: { id: exchangeId }
    });

    if (!exchange) {
      throw new Error('Échange non trouvé');
    }

    if (exchange.proposer_user_id !== userId && exchange.receiver_user_id !== userId) {
      throw new Error('Utilisateur non autorisé pour cet échange car l\'user ne correspond pas ni au proposeur ni au receveur');
    }

    const object = await Object.findOne({
        where: { id: objectId }
      });
  
    if (!object) {
    throw new Error('Objet non trouvé');
    }

    if (object.user_id !== userId) {
        throw new Error('L\'utilisateur n\'est pas le propriétaire de l\'objet');
    }

    const exchangeObject = await ExchangeObject.create({
      exchange_id: exchangeId,
      object_id: objectId,
      user_id: userId
    });

    return exchangeObject;
  }
exports.deleteExchangeObject = async (id) => {
    try {
        const exchangeObject = await ExchangeObject.findByPk(id);
        if (!exchangeObject) {
            throw new Error('ExchangeObject not found');
        }
        await exchangeObject.destroy();
        return exchangeObject;
    } catch (error) {
        throw error;
    }
};

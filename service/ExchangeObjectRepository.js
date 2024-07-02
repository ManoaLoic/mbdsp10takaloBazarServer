const ExchangeObject = require("../models/ExchangeObject");
const Exchange = require("../models/Exchange");
const User = require("../models/User");
const Object = require("../models/Object");
const { Op } = require('sequelize');

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

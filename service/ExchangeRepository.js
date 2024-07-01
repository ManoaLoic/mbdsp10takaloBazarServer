const Exchange = require("../models/Exchange");
const ExchangeObject = require("../models/ExchangeObject");
const User = require("../models/User");
const Object = require("../models/Object");

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

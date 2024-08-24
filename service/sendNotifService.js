const admin = require('../config/connectionFirebase');

exports.sendNotif = async (token, motif) => {
    const title = "Notification";
    let message = null;

    if (motif === "Accepted") {
        message = "Votre offre est accepté!"
    } else if (motif === "Rejected") {
        message = "Votre offre a été rejeté!"
    } else if (motif === "Proposed") {
        message = "Votre avez une proposition d'offre!"
    }

    const messagePayload = {
        notification: {
            title: title,
            body: message
        }
    };

    const response = await admin.messaging().send({
        ...messagePayload,
        token: token
    });
    console.log(`Notification envoyée avec succès à ${token}:`, response);
};
const Device = require('../../models/Firebase/DeviceSchema');
const admin = require('../../config/connectionFirebase');

class DeviceSchemaRepository {

    async checkDevice(userId, serialNumber, tokken){
        try {
          const user = await Device.findOne({ userID : userId });
            if (user) {
                const existingDeviceIndex = user.infos.findIndex(info => 
                    info.serialNumber && info.serialNumber === serialNumber
                );
                if (existingDeviceIndex > -1) {
                user.infos[existingDeviceIndex].tokken = tokken;
                } else {
                user.infos.push({ serialNumber , tokken});
                }
                await user.save();
                console.log('Appareil enregistré ou mis à jour avec succès');
          } else {
            const newUser = new Device({
              userID : userId,
              infos: [{ serialNumber, tokken }]
            });
      
            await newUser.save();
            console.log('Nouvel utilisateur créé avec un appareil');
          }
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de l\'appareil:', error);
        }
      };
      

      async sendNotification(userID) {
        try {
            const user = await Device.findOne({ userID: userID });
            if (!user) {
                console.error('Aucun utilisateur trouvé avec cet ID');
                return;
            }
    
            const title = "Titre du Notification";
            const message = "Message du Notification";
    
            const messagePayload = {
                notification: {
                    title: title,
                    body: message
                }
            };
    
            for (let deviceInfo of user.infos) {
                if (deviceInfo.tokken) {
                    const response = await admin.messaging().send({
                        ...messagePayload,
                        token: deviceInfo.tokken
                    });
                    console.log(`Notification envoyée avec succès à ${deviceInfo.serialNumber}:`, response);
                } else {
                    console.error(`Aucun token trouvé pour l'appareil avec le numéro de série ${deviceInfo.serialNumber}`);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
        }
    }
    
    async checkAndSendNotification(serialNumber,tokken,userID){
        this.saveDevice(serialNumber,tokken,userID);
        this.sendNotification(userID);
    }
}

module.exports = new DeviceSchemaRepository();

const UserRepository = require('./service/UserRepository'); // Assurez-vous que le chemin est correct
require('dotenv').config();

const createAdminUser = async () => {
    const adminUserData = {
        username: 'admin',
        password: 'admin1234', // Remplacez par le mot de passe souhaité
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        gender: 'Other'
    };

    try {
        // Appel de la méthode pour enregistrer l'utilisateur avec le type d'utilisateur admin
        const adminUser = await UserRepository.register(adminUserData);
        console.log('Admin user created successfully:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

createAdminUser();

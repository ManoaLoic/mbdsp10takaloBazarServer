const User = require('../models/User');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");
require('dotenv').config();
const { uploadFile } = require('../service/fileService');
const mime = require('mime-types');

exports.login = async (username, pwd, type) => {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email: username }
                ],
                type: type
            }
        });
        if (user) {
            if (user.status === 'Deleted') {
                const error = new Error('Votre compte a été désactivé. Vous ne pouvez pas vous connecter.');
                error.statusCode = 403;
                throw error;
            }
            const isPasswordValid = await bcrypt.compare(pwd, user.password);
            if (isPasswordValid) {
                const token = getTokenUser(user);
                return {
                    token,
                    username: user.username,
                };
            }
        }
        return null;
    } catch (error) {
        throw error;
    }
};

exports.register = async (userData) => {
    try {
        const { username, password, email, first_name, last_name, gender } = userData;

        // Vérifier si l'username ou l'email existe déjà
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            const errorMessage = existingUser.username === username ? "Username déja existant" : "Email déja existant";
            const error = new Error(errorMessage);
            error.name = 'SequelizeUniqueConstraintError';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
            gender,
            type: process.env.STANDARD_PROFILE,
            created_at: new Date(),
            updated_at: new Date(),
            status: 'Available',
        });

        const token = getTokenUser(newUser);

        return {
            token,
            username: newUser.username,
        };
    } catch (error) {
        throw error;
    }
};

exports.addUser = async (userData) => {
    try {
        const { username, password, email, first_name, last_name, gender, role, status, profile_picture } = userData;

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            const errorMessage = existingUser.username === username ? "Username déja existant" : "Email déja existant";
            const error = new Error(errorMessage);
            error.name = 'SequelizeUniqueConstraintError';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePictureUrl = null;
        if (profile_picture) {
            const fileExtension = mime.extension(profile_picture.split(';')[0].split(':')[1]);
            const fileName = `images/user/${Date.now()}_${(first_name + " " + last_name).replaceAll(' ', '_')}.${fileExtension}`;
            profilePictureUrl = await uploadFile(profile_picture.split('base64,')[1], fileName);
        }

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
            gender,
            type: role,  
            created_at: new Date(),
            updated_at: new Date(),
            status: status || 'Available',
            profile_picture: profilePictureUrl
        });

        const token = getTokenUser(newUser);

        return {
            token,
            username: newUser.username,
        };
    } catch (error) {
        throw error;
    }
};

function getTokenUser(user) {
    return jwt.sign({
        email: user.email,
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        type: user.type,
        jti: user.id + '-' + new Date().getTime(),
    }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRATION_TOKEN
    });
}

// Fiche Utilisateur
exports.getUserProfile = async (userId) => {
    try {
        console.log("ato");
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 'gender', 'created_at','status']
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé!');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_picture: user.profile_picture,
            gender: user.gender,
            created_at: user.created_at,
            status : user.status
        };
    } catch (err) {
        throw err;
    }
};

exports.userUpdate = async (id, updates, role, userId) => {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        const error = new Error('Utilisateur non trouvé');
        error.statusCode = 404;
        throw error;
      }
      if(role === 'USER'){
        console.log(id , user.id);
        if(userId != user.id){
            const error = new Error('Vous n\'êtes pas autorisé à modifier cet utilisateur');
            error.statusCode = 403;
            throw error;
        }
      }

      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }
      
    if(updates.image){
        const fileExtension = mime.extension(updates.image.split(';')[0].split(':')[1]);
        const fileName = `images/user/${Date.now()}_${(user.first_name+" "+user.last_name).replaceAll(' ', '_')}.${fileExtension}`;
        updates.profile_picture = await uploadFile(updates.image.split('base64,')[1], fileName);
    }

      return await user.update(updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

exports.getAllUsers = async ({ page = 1, limit = 10, search = '', gender = '', type = '' }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Sequelize.Op.or] = [
            { username: { [Sequelize.Op.iLike]: `%${search}%` } },
            { email: { [Sequelize.Op.iLike]: `%${search}%` } },
            { first_name: { [Sequelize.Op.iLike]: `%${search}%` } },
            { last_name: { [Sequelize.Op.iLike]: `%${search}%` } }
        ];
    }

    if (gender) {
        where.gender = gender;
    }

    if (type) {
        where.type = type;
    }


    const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit,
        offset
    });

    const totalPages = Math.ceil(count / limit);

    return {
        totalItems: count,
        totalPages: totalPages,
        currentPage: page,
        users: rows
    };
}

// Suppression User
exports.userRemove = async (id) => {
    // 
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }
      await user.update({
        status : 'Deleted',
        deleted_at : new Date()
      });
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
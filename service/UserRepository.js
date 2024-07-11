const User = require('../models/User');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");
require('dotenv').config();

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
        const { username, password, email, first_name, last_name, gender, role } = userData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
            gender,
            type: role,  // Utiliser le rôle fourni
            created_at: new Date(),
            updated_at: new Date(),
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

exports.userUpdate = async (id, updates) => {
    // 
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }

      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      await user.update(updates);
      return user;
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
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.login = async (username,pwd,type) => {
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
    if(user){
        const isPasswordValid = await bcrypt.compare(pwd, user.password);
        if (isPasswordValid) {
            const token = getTokenUser(user);
           return {
                token,
                username : user.username,
           };
        }
    }
    return null;
  } catch (error) {
    throw error;
  }
};


function getTokenUser(user) {
    console.log('ttt',process.env.SECRET_KEY,process.env.EXPIRATION_TOKEN);
    return jwt.sign({
        email: user.email,
        id: user.id,
        nom: user. first_name,
        prenom: user. last_name,
        photo: user.username,
        type: user.type,
    }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRATION_TOKEN
    });
}

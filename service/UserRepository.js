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
    return jwt.sign({
        email: user.email,
        id: user._id,
        first_name: user. first_name,
        last_name: user. last_name,
        username: user.username,
        type: user.type,
    }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRATION_TOKEN
    });
}

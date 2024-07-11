const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevokedToken = sequelize.define('RevokedToken', {
    jti: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},
{
    tableName: 'RevokedTokens',
    timestamps: false,
});

module.exports = RevokedToken;

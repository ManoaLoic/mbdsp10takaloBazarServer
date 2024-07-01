const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Exchange = require('./Exchange');
const Object = require('./Object');
const User = require('./User');

const ExchangeObject = sequelize.define('ExchangeObject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    exchange_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Exchange,
            key: 'id',
        },
    },
    object_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Object,
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    tableName: 'ExchangeObject',
    timestamps: false,
});

module.exports = ExchangeObject;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Exchange = sequelize.define('Exchange', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    proposer_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    receiver_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    appointment_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    meeting_place: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Exchange',
    timestamps: false,
});

module.exports = Exchange;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Object = require('./Object');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    object_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Object,
            key: 'id',
        },
    },
    reporter_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Report',
    timestamps: false,
});

module.exports = Report;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypeReport = sequelize.define('TypeReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'TypeReport',
    timestamps: false,
});

module.exports = TypeReport;

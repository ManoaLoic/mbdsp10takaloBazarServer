const Report = require("../models/Report");
const Object = require("../models/Object");
const User = require("../models/User");
const { Op } = require('sequelize');

exports.getReportById = async (id) => {
    try {
        const report = await Report.findByPk(id, {
            include: [
                {
                    model: require('../models/Object'),
                    attributes: ['id', 'name', 'description']
                },
            ]
        });
        return report;
    } catch (error) {
        throw error;
    }
};

exports.save = async (report) => {
    try {
        return await Report.create(report);
    } catch (error) {
        throw error;
    }
};

// Liste des Objects Signalés
exports.getReportedObjects = async (page, limit) => {
    try {
        const offset = (page - 1) * limit;

        const { count, rows } = await Report.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Object,
                    attributes: ['id', 'name', 'description', 'image'],
                    include: [
                        { model: User, attributes: ['id', 'username', 'first_name', 'last_name'] }
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'first_name', 'last_name']
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        const formattedReports = rows.map(report => ({
            id: report.id,
            reason: report.reason,
            object_id: report.object_id,
            object: {
                id: report.Object.id,
                name: report.Object.name,
                description: report.Object.description,
                image: report.Object.image,
                user: {
                    id: report.Object.User.id,
                    username: report.Object.User.username,
                    first_name: report.Object.User.first_name,
                    last_name: report.Object.User.last_name
                }
            },
            reporter_user: {
                id: report.User.id,
                username: report.User.username,
                first_name: report.User.first_name,
                last_name: report.User.last_name
            },
            created_at: report.created_at,
            updated_at: report.updated_at
        }));

        return {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            reports: formattedReports
        };
    } catch (error) {
        throw error;
    }
};
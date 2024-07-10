const Report = require("../models/Report");
const Object = require("../models/Object");
const User = require("../models/User");
const { Op, Sequelize } = require('sequelize');

exports.findReportsByObjectId = async (objectId, filters, offset, limit) => {
    const where = { object_id: objectId };

    if (filters.reason) {
        where.reason = { [Op.like]: `%${filters.reason}%` };
    }

    if (filters.created_at_start || filters.created_at_end) {
        where.created_at = {};
        if (filters.created_at_start) {
            where.created_at[Op.gte] = filters.created_at_start;
        }
        if (filters.created_at_end) {
            where.created_at[Op.lte] = filters.created_at_end;
        }
    }

    return Report.findAndCountAll({
        where,
        include: [
            {
                model: User,
                attributes: ['id', 'username', 'email'],
            },
        ],
        offset,
        limit,
    });
}

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
            attributes: [
                'object_id',
                [Sequelize.fn('COUNT', Sequelize.col('Report.id')), 'reportCount'],
                [Sequelize.col('Object.name'), 'object_name']
            ],
            include: [
                {
                    model: Object,
                    attributes: ['id', 'name'],
                    required: true
                }
            ],
            group: ['Report.object_id', 'Object.id'],
            order: [[Sequelize.literal('COUNT(object_id)'), 'DESC']],
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(count.length / limit);

        return {
            totalItems: count.length,
            totalPages: totalPages,
            currentPage: page,
            reports: rows
        };
    } catch (error) {
        throw error;
    }
};
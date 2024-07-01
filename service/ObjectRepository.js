const { Op } = require('sequelize');
const ObjectModel = require('../models/Object'); // Adjust the path as necessary

class ObjectRepository {
  async getObjects(name, page, limit) {
    const offset = (page - 1) * limit;
    const where = name ? { name: { [Op.iLike]: `%${name}%` } } : {};

    const { rows, count } = await ObjectModel.findAndCountAll({
      where,
      offset,
      limit,
    });

    return {
      objects: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }
}

module.exports = new ObjectRepository();

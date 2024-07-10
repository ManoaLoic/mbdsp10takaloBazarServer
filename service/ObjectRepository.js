const { Op } = require("sequelize");
const ObjectModel = require("../models/Object");
const User = require('../models/User');
const Category = require('../models/Category');

class ObjectRepository {

  async deleteObject(objectId) {
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        throw new Error('Object not found');
      }
      await object.destroy();
      return object;
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }
  
  async getObjects(filters, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const where = {};

    if (filters.name) {
      where.name = { [Op.like]: `%${filters.name}%` };
    }

    if (filters.description) {
      where.description = { [Op.like]: `%${filters.description}%` };
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

    const include = [
      {
        model: User,
        as: 'user',
        where: filters.user_name ? { username: { [Op.like]: `%${filters.user_name}%` } } : undefined,
        required: false
      },
      {
        model: Category,
        as: 'category',
        where: filters.category_name ? { name: { [Op.like]: `%${filters.category_name}%` } } : undefined,
        required: false
      }
    ];

    const { rows: objects, count } = await ObjectModel.findAndCountAll({
      where,
      include,
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      objects,
      totalPages,
      currentPage: page
    };
  }

  async removeObject(objectId, userId) {
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        return null;
      }
      if (object.user_id != userId) {
        return 1;
      }
      object.status = "Removed";
      await object.save();
      return object;
    } catch (error) {
      console.error("Error updating object status:", error);
      throw error;
    }
  }
  async getObject(objectId) {
    try {
      const objectDetails = await ObjectModel.findByPk(objectId, {
        include: [
          { model: User, as: "user", attributes: ["id", "username", "email"] },
          { model: Category, as: "category", attributes: ["id", "name"] },
        ],
      });
      return objectDetails;
    } catch (error) {
      console.error("Error fetching object details:", error);
      throw error;
    }
  }

  // Modifier Object
  async updateObject(objectId, data) {
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        throw new Error('Pas de résultat!');
      }
      await object.update(data);
      return object;
    } catch (error) {
      throw error;
    }
  }

  async createObject(data) {
    try {
      return await ObjectModel.create(data);
    } catch (error) {
      console.error('Error creating object:', error);
      throw error;
    }
  }
}

module.exports = new ObjectRepository();

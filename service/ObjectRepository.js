const { Op } = require("sequelize");
const ObjectModel = require("../models/Object");
const User = require('../models/User');
const Category = require('../models/Category');

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
}

module.exports = new ObjectRepository();

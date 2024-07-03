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
  async removeObject(objectId){
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        return null;
      }
      object.status = 'Removed';
      await object.save();
      return object;
    } catch (error) {
      console.error('Error updating object status:', error);
      throw error;
    }
  }

  // Modifier Object
  async updateObject(objectId,data){
    try{
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
          throw new Error('Pas de résultat!');
      }
      await object.update(data);
      return object;
    }catch(error){
      throw error;
    }
  }
}

module.exports = new ObjectRepository();

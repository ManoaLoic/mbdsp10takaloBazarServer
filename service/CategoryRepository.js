const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    try {
      return await Category.findAll();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

module.exports = new CategoryRepository();

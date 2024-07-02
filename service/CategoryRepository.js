const { Op } = require('sequelize');
const Category = require('../models/Category');

class CategoryRepository {
  async getCategories(name, page, limit) {
    const offset = (page - 1) * limit;
    const where = name ? { name: { [Op.iLike]: `%${name}%` } } : {};

    const { rows, count } = await Category.findAndCountAll({
      where,
      offset,
      limit,
    });

    return {
      categories: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  // Modifier Category
  async updateCategory(categoryId, name) {
    try {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new Error('Categorie Introuvable!');
      }
      category.name = name;
      await category.save();
      return category;
    } catch (error) {
      throw error;
    }
  }

  async addCategory(category) {
    try {
      const newCategory = await Category.create({ name: category });
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }
}

module.exports = new CategoryRepository();

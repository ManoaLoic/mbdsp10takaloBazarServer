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
}

module.exports = new CategoryRepository();

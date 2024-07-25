const { Op } = require('sequelize');
const Category = require('../models/Category');
const Object = require('../models/Object');
const Sequelize = require('sequelize');

class CategoryRepository {

  async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id);
      return category;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Vérifiez les associations avant la suppression
    try {
      await category.destroy();
    } catch (error) {
      if (error.message.includes('violates foreign key constraint')) {
        throw new Error('Category cannot be deleted because it is associated with other records');
      } else {
        throw error;
      }
    }
    return category;
  }


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

  async getCategoryStatistics() {
    try {
      const counts = await Category.findAll({
        attributes: [
          'id',
          'name',
          [Sequelize.fn('COUNT', Sequelize.col('Objects.id')), 'object_count']
        ],
        include: [
          {
            model: Object,
            as: 'Objects',
            attributes: [],
          }
        ],
        group: ['Category.id'],
        order: [['name', 'ASC']],
      });
      return counts;
    } catch (error) {
      console.error('Error counting objects by category:', error);
      throw error;
    }
  }
}


module.exports = new CategoryRepository();

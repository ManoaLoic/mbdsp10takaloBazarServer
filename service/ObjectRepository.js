const { Op } = require("sequelize");
const ObjectModel = require("../models/Object");
const User = require("../models/User");
const Category = require("../models/Category");

class ObjectRepository {
  async deleteObject(objectId) {
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        throw new Error("Object not found");
      }
      object.deleted_At = new Date();
      object.status = "Deleted";
      await object.save();
      return object;
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }

  async getMyObjects(
    filters,
    userType,
    userId,
    connectedUserId,
    page = 1,
    limit = 50,
    orderBy = "created_at",
    orderDirection = "DESC"
  ) {
    const offset = (page - 1) * limit;
    const where = {};

    where.deleted_At = null;
    where.user_id = userId;
    if (userId != connectedUserId) {
      where.status = "Available";
    }

    this.applyfilter(filters, where, userType);

    const include = [
      {
        model: User,
        as: "user",
        where: filters.user_name
          ? { username: { [Op.like]: `%{filters.user_name}%` } }
          : undefined,
        required: false,
        attributes: {
          exclude: ["password", "type", "created_at", "updated_at"],
        },
      },
      {
        model: Category,
        as: "category",
        where: filters.category_name
          ? { name: { [Op.like]: `%{filters.category_name}%` } }
          : undefined,
        required: false,
      },
    ];

    const { rows: objects, count } = await ObjectModel.findAndCountAll({
      where,
      include,
      offset,
      limit,
      order: [[orderBy, orderDirection.toUpperCase()]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      objects,
      totalPages,
      currentPage: page,
    };
  }

  async getObjects(
    filters,
    connectedUserId,
    userType,
    page = 1,
    limit = 50,
    orderBy = "created_at",
    orderDirection = "DESC"
  ) {
    const offset = (page - 1) * limit;
    const where = {};

    where.deleted_At = null;
    if (userType !== "ADMIN") {
      if (connectedUserId) {
        where.user_id = { [Op.ne]: connectedUserId };
      }
      where.status = "Available";
    }

    this.applyfilter(filters, where, userType);

    const include = [
      {
        model: User,
        as: "user",
        required: true,
        attributes: {
          exclude: ["password", "type", "created_at", "updated_at"],
        },
        where: { status: "Available" },
      },
      {
        model: Category,
        as: "category",
        required: false,
      },
    ];

    const { rows: objects, count } = await ObjectModel.findAndCountAll({
      where,
      include,
      offset,
      limit,
      order: [[orderBy, orderDirection.toUpperCase()]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      objects,
      totalPages,
      currentPage: page,
    };
  }

  applyfilter(filters, where, userType) {
    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (filters.description) {
      where.description = { [Op.iLike]: `%${filters.description}%` };
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

    if (filters.updated_at_start || filters.updated_at_end) {
      where.updated_at = {};
      if (filters.updated_at_start) {
        where.updated_at[Op.gte] = filters.updated_at_start;
      }
      if (filters.updated_at_end) {
        where.updated_at[Op.lte] = filters.updated_at_end;
      }
    }

    if (userType === "ADMIN") {
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.deleted_at_start || filters.deleted_at_end) {
        where.deleted_At = {};
        if (filters.deleted_at_start) {
          where.deleted_At[Op.gte] = filters.deleted_at_start;
        }
        if (filters.deleted_at_end) {
          where.deleted_At[Op.lte] = filters.deleted_at_end;
        }
      }
    }
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

  async rePostObject(objectId, userId) {
    try {
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        return null;
      }
      if (object.user_id != userId) {
        return 1;
      }
      object.status = "Available";
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
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email", "profile_picture", "gender"],
          },
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
  async updateObject(objectId, data, userID) {
    try {
      const user = await User.findByPk(userID);
      const object = await ObjectModel.findByPk(objectId);
      if (!object) {
        const error = new Error("Objet non trouvé");
        error.statusCode = 404;
        throw error;
      }
      if (!user) {
        const error = new Error(
          "Utilisateur non trouvé.Veuillez vous reconnectez!"
        );
        error.statusCode = 404;
        throw error;
      }
      if (user.type === "USER") {
        if (object.user_id !== user.id) {
          const error = new Error(
            "Vous ne pouvez pas modifier cet Objet car ce n'est pas à vous!"
          );
          error.statusCode = 403;
          throw error;
        } else {
          await object.update(data);
        }
      }
      if (user.type === "ADMIN") {
        await object.update(data);
      }
      return object;
    } catch (error) {
      throw error;
    }
  }

  async createObject(data) {
    try {
      return await ObjectModel.create(data);
    } catch (error) {
      console.error("Error creating object:", error);
      throw error;
    }
  }
}

module.exports = new ObjectRepository();

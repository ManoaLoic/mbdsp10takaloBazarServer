const ObjectRepository = require("../service/ObjectRepository");
const ReportRepository = require("../service/ReportRepository");
const { uploadFile } = require('../service/fileService');
const mime = require('mime-types');

exports.getReports = async (req, res) => {
  const { objectId } = req.params;
  const { page = 1, limit = 10, ...filters } = req.query;
  const offset = (page - 1) * limit;

  try {
    const object = await ObjectRepository.getObject(objectId);
    if (!object) {
      return res.status(404).json({ message: 'Object not found' });
    }

    const { rows: reports, count } = await ReportRepository.findReportsByObjectId(objectId, filters, offset, limit);

    const totalPages = Math.ceil(count / limit);

    return res.json({
      object,
      reports,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createObject = async (req, res) => {
  try {
    const { name, description, category_id, image_file, user_id } = req.body;

    if (!image_file) {
      return res.status(400).send('Le fichier image est requis.');
    }

    const fileExtension = mime.extension(image_file.split(';')[0].split(':')[1]);
    const fileName = `images/${Date.now()}_${name.replaceAll(' ', '_')}.${fileExtension}`;
    const imageUrl = await uploadFile(image_file.split('base64,')[1], fileName);

    // Vérifier le rôle de l'utilisateur
    const isAdmin = req.user.type === process.env.ADMIN_PROFILE;
    const finalUserId = isAdmin ? user_id : req.user.id;

    if (!finalUserId) {
      return res.status(400).send('L\'ID utilisateur est requis.');
    }

    const newObject = {
      name,
      description,
      image: imageUrl,
      status: 'Available',
      date: new Date(),
      user_id: finalUserId,
      category_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const object = await ObjectRepository.createObject(newObject);
    res.status(201).json(object);
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.getObjects = async (req, res) => {
  try {
    let { page, limit, name, description, user_id, category_id, created_at_start, created_at_end, status, deleted_at_start, deleted_at_end, updated_at_start, updated_at_end, order_by, order_direction } = req.query;
    page = page || "1";
    limit = limit || "50";

    const filters = {
      name,
      description,
      user_id,
      category_id,
      created_at_start,
      created_at_end,
      status,
      deleted_at_start,
      deleted_at_end,
      updated_at_start,
      updated_at_end
    };

    const { type, id } = req.user || {};

    order_by = order_by || 'created_at';
    order_direction = order_direction || 'DESC';

    const { objects, totalPages, currentPage } = await ObjectRepository.getObjects(filters, id, type, parseInt(page), parseInt(limit), order_by, order_direction);

    res.status(200).json({
      data: {
        objects,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.removeObject = async (req, res) => {
  const { objectId } = req.params;

  try {
    const updatedObject = await ObjectRepository.removeObject(objectId, req.user.id);
    if (!updatedObject) {
      return res.status(404).json({ error: "Objet non trouvé" });
    }
    if (updatedObject == 1) {
      return res
        .status(403)
        .json({
          error:
            "Vous n'avez pas l'autorisation de retirer cet objet, car vous n'en êtes pas le propriétaire.",
        });
    }
    return res
      .status(200)
      .json({
        message: "Statut mis à jour en 'removed'",
        object: updatedObject,
      });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'objet:", error);
    return res
      .status(500)
      .json({ error: "Erreur interne du serveur: " + error.message });
  }
};

exports.getObject = async (req, res) => {
  const { objectId } = req.params;
  try {
    const objectDetails = await ObjectRepository.getObject(objectId);
    if (!objectDetails) {
      return res.status(404).json({ error: 'Objet non trouvé' });
    }
    return res.status(200).json(objectDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'objet:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur:' + error.message });
  }
}

exports.updateObject = async (req, res) => {
  try {
    const objectId = req.params.id;
    const { name, description, category_id, image_file } = req.body;
    const userID = req.user.id;

    // if (!image_file) {
    //   return res.status(400).send('Image file is required.');
    // }


    const data = {
      name,
      description,
      category_id
    };

    if (image_file) {
      const fileExtension = mime.extension(image_file.split(';')[0].split(':')[1]);
      const fileName = `images/${Date.now()}_${name.replaceAll(' ', '_')}.${fileExtension}`;
      const imageUrl = await uploadFile(image_file.split('base64,')[1], fileName);
      data.image = imageUrl;
    }

    const updatedObject = await ObjectRepository.updateObject(objectId, data, userID);

    res.status(200).json({
      message: "SUCCESS",
      data: updatedObject
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Delete an Object
exports.deleteObject = async (req, res) => {
  try {
    const { objectId } = req.params;
    const deletedObject = await ObjectRepository.deleteObject(objectId, req.user.id);
    res.status(200).json({
      message: 'Object deleted successfully',
      data: deletedObject
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

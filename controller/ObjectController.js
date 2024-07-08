const ObjectRepository = require("../service/ObjectRepository");
const { uploadFile } = require('../service/fileService');
const mime = require('mime-types');

exports.createObject = async (req, res) => {
  try {
    const { name, description, category_id, image_file } = req.body;

    if (!image_file) {
      return res.status(400).send('Image file is required.');
    }

    const fileExtension = mime.extension(image_file.split(';')[0].split(':')[1]);
    const fileName = `images/${Date.now()}_${name.replaceAll(' ', '_')}.${fileExtension}`;
    const imageUrl = await uploadFile(image_file.split('base64,')[1], fileName);

    const newObject = {
      name,
      description,
      image: imageUrl,
      status: 'Available',
      date: new Date(),
      user_id: req.user.id,
      category_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const object = await ObjectRepository.createObject(newObject);
    res.status(201).json(object);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getObjects = async (req, res) => {
  try {
    let { page, limit, name, description, user_name, category_name, created_at_start, created_at_end } = req.query;
    page = page || "1";
    limit = limit || "50";

    const filters = {
      name,
      description,
      user_name,
      category_name,
      created_at_start,
      created_at_end
    };

    const { objects, totalPages, currentPage } = await ObjectRepository.getObjects(filters, parseInt(page), parseInt(limit));

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
    const updatedObject = await ObjectRepository.removeObject(objectId);
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
    const data = req.body;
    const updatedObject = await ObjectRepository.updateObject(objectId, data);
    res.status(200).json({
      message: "SUCCESS",
      data: updatedObject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

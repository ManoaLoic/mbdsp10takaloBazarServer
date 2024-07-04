const ObjectRepository = require("../service/ObjectRepository");
const path = require('path');
const { validationResult, check } = require('express-validator');

exports.createObject = [
    check('name').notEmpty().withMessage('Le nom est requis.'),
    check('description').notEmpty().withMessage('La description est requise.'),
    check('status').notEmpty().withMessage('Le statut est requis.'),
    check('date').isISO8601().withMessage('La date doit être au format ISO 8601.'),
    check('user_id').isInt().withMessage('L\'ID utilisateur doit être un entier.'),
    check('category_id').isInt().withMessage('L\'ID de la catégorie doit être un entier.'),
  
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const data = req.body;
  
      if (req.file) {
        data.image = path.join('uploads', req.file.filename);
      }
  
      try {
        const newObject = await ObjectRepository.createObject(data);
        res.status(201).json({
          message: 'Object created successfully',
          data: newObject,
        });
      } catch (error) {
        res.status(500).json({
          message: 'ERROR',
          error: error.message,
        });
      }
    }
  ];

exports.getObjects = async (req, res) => {
    try {
        let { page, limit, q, userID } = req.query;
        page = page || "1";
        limit = limit || "50";

        const { objects, totalPages, currentPage } = await ObjectRepository.getObjects(q, parseInt(page), parseInt(limit), userID);

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
        return res.status(500).json({ error: 'Erreur interne du serveur:'+error.message });
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

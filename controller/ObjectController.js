const ObjectRepository = require("../service/ObjectRepository");

exports.getObjects = async (req, res) => {
  try {
    let { page, limit, q } = req.query;
    page = page || "1";
    limit = limit || "50";

    const { objects, totalPages, currentPage } =
      await ObjectRepository.getObjects(q, parseInt(page), parseInt(limit));

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


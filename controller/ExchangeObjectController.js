const ExchangeObjectRepository = require("../service/ExchangeObjectRepository");

exports.update = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedExchangeObject = await ExchangeObjectRepository.update(
      id,
      updateData
    );

    if (!updatedExchangeObject) {
      return res.status(404).json({ message: "objet d'échange inconnu" });
    }

    res.status(200).json(updatedExchangeObject);
  } catch (error) {
    res.status(500).json({
      message: "Erreur durant la mise à jour de l'objet d'échange",
      error: error.message,
    });
  }
};

exports.getListeExchangeObjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const exchangeObjects =
      await ExchangeObjectRepository.getListeExchangeObjects(
        req.query.idExchange,
        page,
        limit
      );
    res.status(200).json({
      message: "SUCCESS",
      data: exchangeObjects,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR", error: error.message });
  }
};

exports.addExchangeObject = async (req, res) => {
    const { exchangeId, objectId, userId } = req.body;

    try {
        const exchangeObject = await ExchangeObjectRepository.addExchangeObject(exchangeId, objectId, userId);
        return res.status(201).json({ exchangeObject });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'objet d\'échange:', error);
        return res.status(400).json({ error: error.message });
    }
}
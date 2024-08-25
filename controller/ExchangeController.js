const ExchangeRepository = require("../service/ExchangeRepository");
const sendNotifService = require("../service/sendNotifService");

exports.getExchanges = async (req, res) => {
  let { page, limit, orderBy, orderDirection, ...filters } = req.query;
  page = page || "1";
  limit = limit || "50";
  const offset = (page - 1) * limit;


  try {
    const { rows: exchanges, count } = await ExchangeRepository.findExchanges(filters, offset, parseInt(limit), orderBy, orderDirection);

    const totalPages = Math.ceil(count / limit);

    return res.json({
      exchanges,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getExchangeById = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const exchange = await ExchangeRepository.findExchangeById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found" });
    }
    return res.status(200).json(exchange);
  } catch (error) {
    console.error('Error fetching exchange:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTopUsersByExchanges = async (req, res) => {
  try {
    const topUsers = await ExchangeRepository.getTopUsersByExchanges();

    res.status(200).json({
      data: topUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.getOpenExchanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const exchanges = await ExchangeRepository.getOpenExchanges(userId);

    res.status(200).json({
      data: exchanges,
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.getCount = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Status parameter is required" });
    }

    const count = await ExchangeRepository.getCountByStatus(status);

    res.status(200).json({ status, count });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.proposerExchange = async (req, res) => {
  try {
    const prpUserId = req.user.id;
    const {
      rcvUserId,
      rcvObjectId,
      prpObjectId
    } = req.body;
    const exchange = await ExchangeRepository.proposerExchange(
      prpUserId,
      rcvUserId,
      rcvObjectId,
      prpObjectId
    );

    res.status(201).json({
      message: "SUCCESS",
      exchange: exchange,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.acceptExchange = async (req, res) => {
  const { exchangeId } = req.params;
  const body = req.body;
  const userId = req.user.id;
  try {

    if (!body.meeting_place) {
      res.status(400).json({
        error: 'Lieu du rendez-vous est requis',
      });
      return;
    }
    if (!body.appointment_date) {
      res.status(400).json({
        error: 'Date du rendez-vous est requis',
      });
      return;
    }
    if (!body.latitude ^ !body.longitude) {
      res.status(400).json({
        error: 'Les coordonnées ne sont pas complètes',
      });
      return;
    }
    const exchange = await ExchangeRepository.acceptExchange(
      exchangeId,
      userId,
      body
    );
    res.status(200).json({
      message: "Échange accepté avec succès",
      exchange: exchange,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.getHistoriqueExchange = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";

    const exchangeHistory = await ExchangeRepository.getHistoriqueExchange(
      userId,
      status,
      page,
      limit
    );

    res.status(200).json({
      message: "SUCCESS",
      data: exchangeHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};

exports.rejectExchange = async (req, res) => {
  const { exchangeId } = req.params;
  const { note } = req.body;
  if (!note) {
    return res
      .status(400)
      .json({ error: "Veuillez préciser la raison du rejet de l'échange." });
  }

  try {
    const updatedExchange = await ExchangeRepository.rejectExchange(
      exchangeId,
      note,
      req.user.id
    );
    if (!updatedExchange) {
      return res.status(404).json({ error: "Échange non trouvé" });
    }
    if (updatedExchange == 1) {
      return res
        .status(403)
        .json({
          error:
            "Vous ne pouvez pas rejeter cet échange, car vous n'êtes pas la personne associée à cet échange.",
        });
    }
    return res
      .status(200)
      .json({
        message: "Échange rejeté avec succès",
        exchange: updatedExchange,
      });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de l'échange:",
      error
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.getExchangesBetweenDates = async (req, res) => {
  const { date1, date2, status } = req.query;
  try {
    const exchanges = await ExchangeRepository.getExchangesBetweenDates(
      date1,
      date2,
      status
    );
    return res.status(200).json({ exchanges });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
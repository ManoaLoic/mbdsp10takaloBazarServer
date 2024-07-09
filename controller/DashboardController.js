const categoryRepository = require("../service/CategoryRepository");
const ExchangeRepository = require("../service/ExchangeRepository");

exports.getStatistics = async (req, res) => {
    const { date1, date2, status } = req.query;
  try {
    const [
      ongoingExchanges,
      objectsByCategory,
      exchangesBetweenDates,
      exchangesByUser,
    ] = await Promise.all([
      ExchangeRepository.getCountByStatus ('Proposed'),
      categoryRepository.getCategoryStatistics(),
      ExchangeRepository.getExchangesBetweenDates(date1, date2, status),
      ExchangeRepository.getTopUsersByExchanges(),
    ]);

    return res.status(200).json({
      ongoingExchanges,
      objectsByCategory,
      exchangesBetweenDates,
      exchangesByUser,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    return res.status(500).json({ error: "Internal Server Error:"+error.message });
  }
};

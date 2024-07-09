const categoryRepository = require("../service/CategoryRepository");
const ExchangeRepository = require("../service/ExchangeRepository");

exports.getStatistics = async (req, res) => {
  try {
    const [
      ongoingExchanges,
      objectsByCategory,
      exchangesByUser,
    ] = await Promise.all([
      ExchangeRepository.getCountByStatus ('Proposed'),
      categoryRepository.getCategoryStatistics(),
      ExchangeRepository.getTopUsersByExchanges(),
    ]);

    return res.status(200).json({
      ongoingExchanges,
      objectsByCategory,
      exchangesBetweenDates: null,
      exchangesByUser,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    return res.status(500).json({ error: "Internal Server Error:"+error.message });
  }
};

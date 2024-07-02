const ExchangeObjectRepository = require ('../service/ExchangeObjectRepository');

exports.getListeExchangeObjects = async (req,res) =>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const exchangeObjects = await ExchangeObjectRepository.getListeExchangeObjects(req.query.idExchange,page,limit);
        res.status(200).json({
            message : "SUCCESS",
            data : exchangeObjects
        });
    }catch(error){
        res.status(500).json({ message: "ERROR",error: error.message });
    }
} 
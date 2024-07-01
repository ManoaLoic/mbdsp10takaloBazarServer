const ObjectRepository = require('../service/ObjectRepository');

exports.getObjects = async (req, res) => {
    try {
        let { page, limit, q } = req.query;
        page = page || "1";
        limit = limit || "50";

        const { objects, totalPages, currentPage } = await ObjectRepository.getObjects(q, parseInt(page), parseInt(limit));

        res.status(200).json({
            data: {
                objects,
                totalPages,
                currentPage,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'ERROR',
            error: error.message,
        });
    }
};

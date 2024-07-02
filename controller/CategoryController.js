const categoryRepository = require('../service/CategoryRepository');

exports.updateCategory = async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nom de la Categorie obligatoire!' });
      }
      const updatedCategory = await categoryRepository.updateCategory(req.params.id, name);
      res.status(200).json({
        message : "SUCCESS",
        category : updatedCategory
      });
    } catch (error) {
      res.status(500).json({ message: "ERROR",error: error.message });
    }
};
const categoryRepository = require('../service/CategoryRepository');

exports.getCategories = async (req, res) => {
  try {
    let { page, limit, q } = req.query;
    page = page || "1";
    limit = limit || "50";

    const { categories, totalPages, currentPage } = await categoryRepository.getCategories(q, parseInt(page), parseInt(limit));

    res.status(200).json({
      data: {
        categories,
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

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom de la Categorie obligatoire!' });
    }
    const updatedCategory = await categoryRepository.updateCategory(req.params.id, name);
    res.status(200).json({
      message: "SUCCESS",
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR", error: error.message });
  }
};

exports.addCategory = async (req, res) => {
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
  }
  try {
    const newCategory = await categoryRepository.addCategory(category);
    return res.status(201).json({ message: 'Catégorie ajoutée avec succès', category: newCategory });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur:' + error.message });
  }
}
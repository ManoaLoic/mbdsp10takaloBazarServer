const categoryRepository = require('../service/CategoryRepository');

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryRepository.deleteCategory(id);
    res.status(200).json({
      message: 'Catégorie supprimée avec succès',
      data: deletedCategory
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        message: "La catégorie n'a pas été trouvée. Veuillez vérifier l'ID fourni."
      });
    } else if (error.message === 'Category cannot be deleted because it is associated with other records') {
      return res.status(400).json({
        message: "La catégorie ne peut pas être supprimée car elle est associée à d'autres objets."
      });
    } else if (error.message.includes('violates foreign key constraint')) {
      return res.status(400).json({
        message: "La catégorie ne peut pas être supprimée car elle est associée à d'autres objets."
      });
    } else {
      return res.status(500).json({
        message: "Erreur interne du serveur",
        error: error.message,
      });
    }
  }
};

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

exports.getCategoryStatistics = async (req, res) => {
  try {
    const counts = await categoryRepository.getCategoryStatistics();
    return res.status(200).json(counts);
  } catch (error) {
    console.error("Erreur lors du comptage des objets par catégorie:", error);
    return res
      .status(500)
      .json({ error: "Erreur interne du serveur:" + error.message });
  }
};
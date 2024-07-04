const UserRepository = require("../service/UserRepository");

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({
        error: "Le nom d'utilisateur ou l'email et le mot de passe sont requis",
      });
  }
  try {
    const user = await UserRepository.login(username, password, "USER");
    if (!user) {
      return res
        .status(404)
        .json({
          error:
            "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer.",
        });
    }
    return res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return res
      .status(500)
      .json({ error: "Erreur interne du serveur: " + error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Le nom d'utilisateur ou l'email et le mot de passe sont requis",
    });
  }
  try {
    const admin = await UserRepository.login(username, password, "ADMIN");
    if (!admin) {
      return res.status(404).json({
        error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer.",
      });
    }
    return res.status(200).json({ message: 'Connexion réussie', admin });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return res.status(500).json({ error: "Erreur interne du serveur: " + error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userProfile = await UserRepository.getUserProfile(req.params.userId);
    res.status(200).json({
      message: "SUCCESS",
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const { username, password, email, first_name, last_name, gender } = req.body;
  if (!username || !password || !email || !first_name || !last_name || !gender) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires pour une inscription' });
  }

  try {
    const result = await UserRepository.register({ username, password, email, first_name, last_name, gender });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username ou Email déja existant' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
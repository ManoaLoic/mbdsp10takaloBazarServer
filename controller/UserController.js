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

exports.getUserProfile = async (req, res) => {
  try {
      const userProfile = await UserRepository.getUserProfile(req.params.userId);
      res.status(200).json({
        message : "SUCCESS",
        user : userProfile
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

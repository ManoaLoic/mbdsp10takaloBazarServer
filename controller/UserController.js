const UserRepository = require("../service/UserRepository");
const ObjectRepository = require("../service/ObjectRepository");
const DeviceSchemaRepository = require("../service/FireBaseService/DeviceService");

require('dotenv').config();

exports.getUserObjects = async (req, res) => {
  try {
    let { page, limit, name, description, user_id, category_id, created_at_start, created_at_end, status, deleted_at_start, deleted_at_end, updated_at_start, updated_at_end, order_by, order_direction } = req.query;
    const { userId } = req.params;
    const connectedUserId = req.user.id;
    const userType = req.user.type;

    page = page || "1";
    limit = limit || "50";

    const filters = {
      name,
      description,
      user_id,
      category_id,
      created_at_start,
      created_at_end,
      status,
      deleted_at_start,
      deleted_at_end,
      updated_at_start,
      updated_at_end
    };

    order_by = order_by || 'created_at';
    order_direction = order_direction || 'DESC';

    const { objects, totalPages, currentPage } = await ObjectRepository.getMyObjects(filters, userType, userId, connectedUserId, parseInt(page), parseInt(limit), order_by, order_direction,status);

    res.status(200).json({
      data: {
        objects,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "ERROR",
      error: error.message,
    });
  }
};


exports.loginUser = async (req, res) => {
  const { username, password,serialNumber,tokken } = req.body;

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
      return res.status(400).json({
        success: false,
        error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer."
      });
    }

    if(serialNumber && tokken){
        await DeviceSchemaRepository.checkDevice(user.id,serialNumber,tokken);
    }

    return res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return res.status(error.statusCode || 500).json({
        error: error.message,
      });
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
    const admin = await UserRepository.login(username, password, process.env.ADMIN_PROFILE);
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
    const userProfile = await UserRepository.getUserProfile(req.params.id);
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
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.addUser = async (req, res) => {
  const { username, password, email, first_name, last_name, gender, role, status, profile_picture } = req.body;

  if (!username || !password || !email || !first_name || !last_name || !gender || !role) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires pour ajouter un utilisateur' });
  }

  try {
      const result = await UserRepository.addUser({ username, password, email, first_name, last_name, gender, role, status, profile_picture });
      return res.status(201).json(result);
  } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};


exports.userUpdate = async (req, res) => {
  const { id } = req.params;
  const userType = req.user.type;
  const { username,image, email, oldPassword, password, confirmPassword, first_name, last_name, profile_picture, gender } = req.body;

  if (password && ( !confirmPassword || password !== confirmPassword)) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
  }

  if (password && !oldPassword) {
    return res.status(400).json({ error: 'Veuillez saisir votre mot de passe précédent.' });
  }
  try {
    const updates = {
      username,
      email,
      first_name,
      last_name,
      profile_picture,
      oldPassword,
      image,
      gender,
      password
    };
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const updatedUser = await UserRepository.userUpdate(id, updates, userType, req.user.id);
    return res.status(200).json({ message: 'Profil mis à jour avec succès', user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
}

exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const gender = req.query.gender || '';
  const type = req.query.type || '';

  try {
    const result = await UserRepository.getAllUsers({ page, limit, search, gender, type });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.userRemove = async (req, res) => {
  try {
    const userProfile = await UserRepository.userRemove(req.params.id);
    res.status(200).json({
      message: "SUCCESS",
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
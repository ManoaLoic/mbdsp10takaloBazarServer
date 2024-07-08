const express = require("express");
const router = express.Router();

const ObjectController = require("../controller/ObjectController");

router.patch("/:objectId/remove", ObjectController.removeObject);
router.get("/:objectId", ObjectController.getObject);

module.exports = router;

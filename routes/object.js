const express = require("express");
const router = express.Router();

const ObjectController = require("../controller/ObjectController");

const { authorize } = require('../middleware/auth');

router.patch("/:objectId/remove", ObjectController.removeObject);
router.get("/:objectId", ObjectController.getObject);
router.get("/:objectId/reports", authorize(['ADMIN']), ObjectController.getReports);
router.delete("/:objectId", authorize(['ADMIN']), ObjectController.deleteObject);

module.exports = router;

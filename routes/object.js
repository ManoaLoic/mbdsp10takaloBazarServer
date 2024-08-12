const express = require("express");
const router = express.Router();

const ObjectController = require("../controller/ObjectController");

const { authenticate, authorize } = require('../middleware/auth');

router.patch("/:objectId/remove", authenticate, authorize(['USER']), ObjectController.removeObject);
router.patch("/:objectId/repost", authenticate, authorize(['USER']), ObjectController.repostObject);
router.get("/:objectId", ObjectController.getObject);
router.get("/:objectId/reports", authenticate, authorize(['ADMIN']), ObjectController.getReports);
router.delete("/:objectId", authenticate, authorize(['ADMIN']), ObjectController.deleteObject);

module.exports = router;

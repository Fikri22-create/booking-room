const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const upload = require("../middlewares/upload");
const userController = require("../controllers/user.controller");

router.get("/profile", auth, userController.getMyProfile);
router.put("/profile", auth, upload.single("avatar"), userController.updateMyProfile);
router.put("/profile/password", auth, userController.changePassword);
router.get("/export/excel", auth, role("admin"), userController.exportUsersExcel);
router.get("/", auth, role("admin"), userController.getAllUsers);
router.get("/:id", auth, role("admin"), userController.getUserById);

module.exports = router;
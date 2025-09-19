// routes/user.routes.js
const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user.controller");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);

module.exports = router;

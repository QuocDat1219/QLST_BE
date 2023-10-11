const express = require("express");
const router = express.Router();

const { loginMysql } = require("../controller/loginMysqlController");
router.post("/login", loginMysql);
module.exports = router;

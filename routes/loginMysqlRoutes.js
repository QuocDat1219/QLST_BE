const express = require("express");
const router = express.Router();

const {
  loginMysql,
  getTable,
  getColumnOfTable,
} = require("../controller/loginMysqlController");
router.post("/login", loginMysql);
router.get("/showtable", getTable);
router.get("/showcolumn", getColumnOfTable);
module.exports = router;

const express = require("express");
const router = express.Router();
const { phanTanNgang } = require("../controller/phanTanNgangController");

router.post("/", phanTanNgang);

module.exports = router;

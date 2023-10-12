const express = require("express");
const router = express.Router();

const {
  getAllPhieuNhap,
  getPhieuNhapById,
  createPhieuNhap,
} = require("../controller/phieuNhapController");

router.get("/", getAllPhieuNhap);
router.get("/:id", getPhieuNhapById);
router.post("/", createPhieuNhap);
module.exports = router;

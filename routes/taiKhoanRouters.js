const express = require("express");
const router = express.Router();
const { isAdmin } = require("../auth/auth");
const {
  getAllTaiKhoan,
  getTaiKhoanById,
  createTaiKhoan,
  updateTaiKhoan,
  deleteTaiKhoan,
} = require("../controller/taiKhoanController");
router.get("/", getAllTaiKhoan);
router.get("/:userName", getTaiKhoanById);
router.post("/", createTaiKhoan);
router.put("/:userName", updateTaiKhoan);
router.delete("/:userName", deleteTaiKhoan);

module.exports = router;

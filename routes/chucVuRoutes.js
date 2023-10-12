const express = require("express");
const router = express.Router();
const {
  getAllChucVu,
  getChucVuById,
  createChucVu,
  updateChucVu,
  deleteChucVu,
} = require("../controller/chucVuController");
router.get("/", getAllChucVu);
router.get("/:id", getChucVuById);
router.post("/", createChucVu);
router.put("/:id", updateChucVu);
router.delete("/:id", deleteChucVu);

module.exports = router;

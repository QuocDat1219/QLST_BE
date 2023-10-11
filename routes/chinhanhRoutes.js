const express = require("express");
const router = express.Router();
const {
  getChiNhanh,
  createChiNhanh,
  updateChiNhanh,
  deleteChiNhanh,
  getChiNhanhById,
} = require("../controller/chinhanhController");

router.get("/", getChiNhanh);
router.get("/:id", getChiNhanhById);
router.post("/", createChiNhanh);
router.put("/:id", updateChiNhanh);
router.delete("/:id", deleteChiNhanh);

module.exports = router;

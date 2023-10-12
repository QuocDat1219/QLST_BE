const express = require("express");
const router = express.Router();
const {
  getChiNhanh,
  updateChiNhanh,
  deleteChiNhanh,
  getChiNhanhById,
} = require("../controller/chinhanhController");

router.get("/", getChiNhanh);
router.get("/:id", getChiNhanhById);
router.put("/:id", updateChiNhanh);
router.delete("/:id", deleteChiNhanh);

module.exports = router;

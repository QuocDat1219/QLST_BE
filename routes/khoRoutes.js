const express = require("express");
const router = express.Router();
const {
  getAllKho,
  getKhoById,
  createKho,
  updateKho,
  deleteKho,
} = require("../controller/khoController");

router.get("/", getAllKho);
router.get("/:id", getKhoById);
router.post("/", createKho);
router.put("/:id", updateKho);
router.delete("/:id", deleteKho);
module.exports = router;

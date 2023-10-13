const express = require("express");
const router = express.Router();

const {
  getAllKE,
  getKEById,
  createKE,
  updateKE,
  deleteKE,
} = require("../controller/keHangController");

router.get("/", getAllKE);
router.get("/:id", getKEById);
router.post("/", createKE);
router.put("/:id", updateKE);
router.delete("/:id", deleteKE);
module.exports = router;

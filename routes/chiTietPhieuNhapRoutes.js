const express = require("express");
const router = express.Router();

const {
  getAllCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPById,
  createCHITIETPHIEUNHAP,
  updateCHITIETPHIEUNHAP,
  deleteCHITIETPHIEUNHAP,
} = require("../controller/chitietPhieuNhapController");

router.get("/", getAllCHITIETPHIEUNHAP);
router.get("/:id", getCHITIETPHIEUNHAPById);
router.post("/", createCHITIETPHIEUNHAP);
router.put("/:id", updateCHITIETPHIEUNHAP);
router.delete("/:id", deleteCHITIETPHIEUNHAP);
module.exports = router;

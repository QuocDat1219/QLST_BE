const express = require("express");
const router = express.Router();

const {
  getAllCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPById,
  createCHITIETPHIEUNHAP,
  updateCHITIETPHIEUNHAP,
  deleteCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPDetail,
} = require("../controller/chitietPhieuNhapController");

router.get("/", getAllCHITIETPHIEUNHAP);
router.get("/:id", getCHITIETPHIEUNHAPById);
router.get("/detail", getCHITIETPHIEUNHAPDetail);
router.post("/", createCHITIETPHIEUNHAP);
router.put("/:id", updateCHITIETPHIEUNHAP);
router.post("/deletedetail", deleteCHITIETPHIEUNHAP);
module.exports = router;

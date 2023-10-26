const express = require("express");
const router = express.Router();

const {
  getAllCHITIETHOADON,
  getCHITIETHOADONById,
  createCHITIETHOADON,
  updateCHITIETHOADON,
  deleteCHITIETHOADON,
  getCHITIETHOADONDetail,
} = require("../controller/chiTietHoaDonController");

router.get("/", getAllCHITIETHOADON);
router.get("/:id", getCHITIETHOADONById);
router.get("/detail", getCHITIETHOADONDetail);
router.post("/", createCHITIETHOADON);
router.put("/:id", updateCHITIETHOADON);
router.post("/deletedetail", deleteCHITIETHOADON);
module.exports = router;

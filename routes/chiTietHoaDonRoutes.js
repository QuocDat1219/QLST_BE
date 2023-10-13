const express = require("express");
const router = express.Router();

const {
  getAllCHITIETHOADON,
  getCHITIETHOADONById,
  createCHITIETHOADON,
  updateCHITIETHOADON,
  deleteCHITIETHOADON,
} = require("../controller/chiTietHoaDonController");

router.get("/", getAllCHITIETHOADON);
router.get("/:id", getCHITIETHOADONById);
router.post("/", createCHITIETHOADON);
router.put("/:id", updateCHITIETHOADON);
router.delete("/:id", deleteCHITIETHOADON);
module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getAllPHIEUGIAMGIA,
  getPHIEUGIAMGIAById,
  createPHIEUGIAMGIA,
  updatePHIEUGIAMGIA,
  deletePHIEUGIAMGIA,
} = require("../controller/phieuGiamGiaController");

router.get("/", getAllPHIEUGIAMGIA);
router.get("/:id", getPHIEUGIAMGIAById);
router.post("/", createPHIEUGIAMGIA);
router.put("/:id", updatePHIEUGIAMGIA);
router.delete("/:id", deletePHIEUGIAMGIA);
module.exports = router;

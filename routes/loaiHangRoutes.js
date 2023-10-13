const express = require("express");
const router = express.Router();

const {
  getAllLOAIHANG,
  getLOAIHANGById,
  createLOAIHANG,
  updateLOAIHANG,
  deleteLOAIHANG,
} = require("../controller/loaiHangController");

router.get("/", getAllLOAIHANG);
router.get("/:id", getLOAIHANGById);
router.post("/", createLOAIHANG);
router.put("/:id", updateLOAIHANG);
router.delete("/:id", deleteLOAIHANG);
module.exports = router;

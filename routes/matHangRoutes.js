const express = require("express");
const router = express.Router();

const {
  getAllMATHANG,
  getMATHANGById,
  createMATHANG,
  updateMATHANG,
  deleteMATHANG,
} = require("../controller/matHangController");

router.get("/", getAllMATHANG);
router.get("/:id", getMATHANGById);
router.post("/", createMATHANG);
router.put("/:id", updateMATHANG);
router.delete("/:id", deleteMATHANG);
module.exports = router;

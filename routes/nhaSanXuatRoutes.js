const express = require("express");
const router = express.Router();

const {
  getAllNHASANXUAT,
  getNHASANXUATById,
  createNHASANXUAT,
  updateNHASANXUAT,
  deleteNHASANXUAT,
} = require("../controller/nhaSanXuatController");

router.get("/", getAllNHASANXUAT);
router.get("/:id", getNHASANXUATById);
router.post("/", createNHASANXUAT);
router.put("/:id", updateNHASANXUAT);
router.delete("/:id", deleteNHASANXUAT);
module.exports = router;

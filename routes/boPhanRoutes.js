const express = require("express");
const router = express.Router();
const {
  getAllBoPhan,
  getBoPhanById,
  createBoPhan,
  updateBoPhan,
  deleteBoPhan,
} = require("../controller/boPhanController");
router.get("/", getAllBoPhan);
router.get("/:id", getBoPhanById);
router.post("/", createBoPhan);
router.put("/:id", updateBoPhan);
router.delete("/:id", deleteBoPhan);

module.exports = router;

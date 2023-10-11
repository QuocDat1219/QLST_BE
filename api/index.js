require("dotenv").config();
const { sqlPool, connectSQL } = require("../model/connect_sqlserver");
const { connectMysql } = require("../model/connect_mysql");
const express = require("express");
const chiNhanhRoutes = require("../routes/chinhanhRoutes");
const nhanVienRoutes = require("../routes/nhanVienRoutes");
const khachHangRoutes = require("../routes/khachHangRoutes");
const phanTanNgangHangRoutes = require("../routes/phanTanNgangRoutes");
const loginMysqlRoutes = require("../routes/loginMysqlRoutes");
connectSQL();
connectMysql();
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("ok api");
});

app.use("/api/chinhanh", chiNhanhRoutes);
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api/khachhang", khachHangRoutes);
app.use("/api/phantan", phanTanNgangHangRoutes);
app.use("/api/mysql", loginMysqlRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

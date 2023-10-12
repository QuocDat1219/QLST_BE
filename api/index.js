require("dotenv").config();
const { sqlPool, connectSQL } = require("../model/connect_sqlserver");
const { connectMysql } = require("../model/connect_mysql");
const express = require("express");
const chiNhanhRoutes = require("../routes/chinhanhRoutes");
const nhanVienRoutes = require("../routes/nhanVienRoutes");
const khachHangRoutes = require("../routes/khachHangRoutes");
const phanTanNgangHangRoutes = require("../routes/phanTanNgangRoutes");
const loginMysqlRoutes = require("../routes/loginMysqlRoutes");
const khoRoutes = require("../routes/khoRoutes");
const taiKhoanRoutes = require("../routes/taiKhoanRouters");
const chucVuRoutes = require("../routes/chucVuRoutes");
const bophanRoutes = require("../routes/boPhanRoutes");
const phieuNhapRoutes = require("../routes/phieuNhapRoutes");
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
app.use("/api/kho", khoRoutes);
app.use("/api/taikhoan", taiKhoanRoutes);
app.use("/api/chucvu", chucVuRoutes);
app.use("/api/bophan", bophanRoutes);
app.use("/api/phieunhap", phieuNhapRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

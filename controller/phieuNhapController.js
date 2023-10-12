const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllPhieuNhap = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM PHIEUNHAP";
    const allPHIEUNHAP = await sqlPool.request().query(sqlQuery);
    const isPHIEUNHAP = allPHIEUNHAP.recordset.length;
    if (isPHIEUNHAP > 0) {
      res.status(200).json(allPHIEUNHAP.recordset);
    } else {
      res.status(400).json({ message: "Không có phiếu nhập" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getPhieuNhapById = async (req, res) => {
  const id = req.params.id;
  try {
    const aPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT * FROM PHIEUNHAP WHERE MaPhieuNhap = '${id}'`);
    const count = aPHIEUNHAP.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aPHIEUNHAP.recordset);
    } else {
      res.status(400).send({ message: "Phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createPhieuNhap = async (req, res) => {
  const { reqMaPhieuNhap, reMaNV, reqMaKho, reqDVT, reqNgayLapPhieu } =
    req.body;
  const insertQuery = `INSERT INTO PHIEUNHAP VALUES ('${reqMaPhieuNhap}','${reMaNV}','${reqMaKho}','${reqDVT}','${reqNgayLapPhieu}')`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE MaPhieuNhap = '${reqMaPhieuNhap}'`;
  console.log(insertQuery);
  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (TKExists) {
      res.status(500).send({ message: "Phiếu nhập đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi thêm phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi thêm phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm phiếu nhập không thành công" });
  }
};

const updatePhieuNhap = async (req, res) => {
  const userName = req.params.userName;
  const { reqMaNV, reqMatKhau, reqQuyen } = req.body;
  const updateQuery = `UPDATE PHIEUNHAP SET Matkhau = '${reqMatKhau}',Quyen = '${reqQuyen}' WHERE TenTK = '${userName}'`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE TenTK = '${userName}'`;
  console.log(updateQuery);
  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (!TKExists) {
      res.status(400).send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật phiếu nhập không thành công" });
  }
};

const deletePhieuNhap = async (req, res) => {
  const userName = req.params.userName;
  const deleteteTK = `DELETE FROM PHIEUNHAP WHERE TenTK = '${userName}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE TenTK = '${userName}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .send({ message: "Lỗi khi xóa phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllPhieuNhap,
  getPhieuNhapById,
  createPhieuNhap,
  updatePhieuNhap,
  deletePhieuNhap,
};

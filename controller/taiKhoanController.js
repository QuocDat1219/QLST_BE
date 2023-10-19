const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllTaiKhoan = async (req, res) => {
  try {
    const sqlQuery =
      "SELECT NHANVIEN.TENNV as TenNV, TAIKHOAN.TENTK AS TenTK, TAIKHOAN.QUYEN AS Quyen FROM TAIKHOAN INNER JOIN NHANVIEN ON TAIKHOAN.MANV = NHANVIEN.MANV";
    const allTaiKhoan = await sqlPool.request().query(sqlQuery);
    const isTaiKhoan = allTaiKhoan.recordset.length;
    if (isTaiKhoan > 0) {
      res.status(200).json(allTaiKhoan.recordset);
    } else {
      res.json({ message: "Không có tài khoản" });
    }
  } catch (error) {
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getTaiKhoanById = async (req, res) => {
  const userName = req.params.userName;
  try {
    const aTaiKhoan = await sqlPool
      .request()
      .query(`SELECT * FROM TAIKHOAN WHERE TenTK = '${userName}'`);
    const count = aTaiKhoan.recordset.length;
    if (count > 0) {
      res.status(200).json(aTaiKhoan.recordset);
    } else {
      res.send({ message: "Tài khoản không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createTaiKhoan = async (req, res) => {
  const { reqTenTk, reqMaNV, reqMatKhau, reqQuyen } = req.body;
  const insertQuery = `INSERT INTO TAIKHOAN VALUES ('${reqTenTk}','${reqMaNV}','${reqMatKhau}','${reqQuyen}')`;
  const checkTaiKhoan = `SELECT cOUNT(*) as count FROM TAIKHOAN WHERE TenTK = '${reqTenTk}'`;
  try {
    const TKExists = await checkInsert(checkTaiKhoan);
    if (TKExists) {
      res.send({ message: "Tài khoản đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm tài khoản ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm tài khoản ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm tài khoản thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm tài khoản không thành công" });
  }
};

const updateTaiKhoan = async (req, res) => {
  const userName = req.params.userName;
  const { reqMaNV, reqMatKhau, reqQuyen } = req.body;
  const updateQuery = `UPDATE TAIKHOAN SET Matkhau = '${reqMatKhau}',Quyen = '${reqQuyen}' WHERE TenTK = '${userName}'`;
  const checkTaiKhoan = `SELECT cOUNT(*) as count FROM TAIKHOAN WHERE TenTK = '${userName}'`;
  console.log(updateQuery);
  try {
    const TKExists = await checkInsert(checkTaiKhoan);
    if (!TKExists) {
      res.send({ message: "Không tìm thấy tài khoản" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật tài khoản ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật tài khoản ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật tài khoản thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật tài khoản không thành công" });
  }
};

const deleteTaiKhoan = async (req, res) => {
  const userName = req.params.userName;
  const deleteteTK = `DELETE FROM TAIKHOAN WHERE TenTK = '${userName}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM TAIKHOAN WHERE TenTK = '${userName}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy tài khoản" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa tài khoản ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa tài khoản ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa tài khoản thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllTaiKhoan,
  getTaiKhoanById,
  createTaiKhoan,
  updateTaiKhoan,
  deleteTaiKhoan,
};

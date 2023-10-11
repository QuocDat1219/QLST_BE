const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { request } = require("express");
const getAllKhachHang = async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM KHACHHANG";
    const allKhachHang = await sqlPool.request().query(selectQuery);
    if (allKhachHang.recordset.length > 0) {
      res.status(200).json(allKhachHang.recordset);
    } else {
      res.status(400).send({ message: "Không có khách hàng!" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getKhachHangById = async (req, res) => {
  const id = req.params.id;
  try {
    const selectQuery = `SELECT * FROM KHACHHANG WHERE MaKH = '${id}'`;
    const aKhachHang = await sqlPool.request().query(selectQuery);
    if (aKhachHang.recordset.length > 0) {
      res.status(200).json(aKhachHang.recordset);
    } else {
      res.status(400).send({ message: "Không tìm thấy khách hàng này!" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const checkInsert = async (MaKH) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkQuery = `SELECT COUNT(*) AS count FROM KHACHHANG WHERE MaKH = '${MaKH}'`;
      const sqlCheckResult = await sqlPool.request().query(checkQuery);

      mysqlConnection.query(checkQuery, (mysqlError, mysqlResults) => {
        if (mysqlError) {
          reject(mysqlError);
          return;
        }

        const mysqlCount = mysqlResults[0].count;
        if (sqlCheckResult.recordset[0].count > 0 || mysqlCount > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const createKhachHang = async (req, res) => {
  const {
    reqMaKH,
    reqMaCN,
    reqTenKH,
    reqNgaySinh,
    reqGioiTinh,
    reqDiaChi,
    reqSdt,
  } = req.body;
  const insertQuery = `INSERT INTO KHACHHANG VALUES('${reqMaKH}', '${reqMaCN}', N'${reqTenKH}', '${reqNgaySinh}', '${reqGioiTinh}', N'${reqDiaChi}', '${reqSdt}')`;

  try {
    const khExists = await checkInsert(reqMaKH);
    if (khExists) {
      res.status(500).send({ message: "Khách hàng đã tồn tại!" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res
          .status(500)
          .send({ message: "Lỗi khi thêm khách hàng ở SQL Server " });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi thêm khách hàng ở Mysql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm khách hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Thêm khách hàng không thành công" });
  }
};

const checkUpdate = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkQuery = `SELECT COUNT(*) AS count FROM KHACHHANG WHERE MaKH = '${id}'`;
      const sqlCheckResult = await sqlPool.request().query(checkQuery);

      mysqlConnection.query(checkQuery, (mysqlError, mysqlResults) => {
        if (mysqlError) {
          reject(mysqlError);
          return;
        }

        const mysqlCount = mysqlResults[0].count;
        // Kiểm tra kết quả trên cả hai cơ sở dữ liệu
        if (sqlCheckResult.recordset[0].count > 0 && mysqlCount > 0) {
          resolve(true);
        } else if (sqlCheckResult.recordset[0].count == 0 && mysqlCount > 0) {
          resolve(false);
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateKhachHang = async (req, res) => {
  const id = req.params.id;
  const { reqMaCN, reqTenKH, reqNgaySinh, reqGioiTinh, reqDiaChi, reqSdt } =
    req.body;
  const updateQuery = `UPDATE KHACHHANG SET MACN = '${reqMaCN}', TENKH = N'${reqTenKH}', NGAYSINH = '${reqNgaySinh}', GIOITINH = '${reqGioiTinh}', DIACHI = N'${reqDiaChi}', SDT = '${reqSdt}' WHERE MAKH = '${id}'`;
  try {
    const khExists = await checkUpdate(id);
    if (!khExists) {
      res.status(400).send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật khách hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (sqlError) => {
          if (sqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật khách hàng ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ cập nhật thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật không thành công" });
  }
};

const deleteKhachHang = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM KHACHHANG WHERE MAKH = '${id}'`;
  try {
    const khExists = await checkUpdate(id);
    if (!khExists) {
      res.status(400).send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res
          .status(500)
          .send({ message: "Lỗi khi xóa khách hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (sqlError) => {
          if (sqlError) {
            res.status(500).send({ message: "Lỗi khi xóa khách hàng ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ xóa thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};
module.exports = {
  getAllKhachHang,
  getKhachHangById,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
};

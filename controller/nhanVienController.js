const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");

const getAllNhanVien = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM NHANvIEN";
    const allNhanVien = await sqlPool.request().query(sqlQuery);
    if (allNhanVien.recordset.length > 0) {
      res.status(200).json(allNhanVien.recordset);
    } else {
      res.status(400).send({ message: "Không có nhân viên" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getNhanVienById = async (req, res) => {
  try {
    const sqlQuery = `SELECT * FROM NHANVIEN WHERE MaNV = '${req.params.id}'`;
    const aNhanVien = await sqlPool.request().query(sqlQuery);

    if (aNhanVien.recordset.length > 0) {
      res.status(200).json(aNhanVien.recordset);
    } else {
      res.status(400).send({ message: "Không tìm thấy nhân viên!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu!" });
  }
};

// Hàm kiểm tra mã nhân viên trên cả MySQL và SQL Server
const checkMaNV = async (maNV) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra trên SQL Server
      const checkQuery = `SELECT COUNT(*) AS count FROM NHANVIEN WHERE MaNV = '${maNV}'`;
      const sqlCheckResult = await sqlPool.request().query(checkQuery);

      // Kiểm tra trên MySQL
      mysqlConnection.query(checkQuery, (mysqlError, mysqlResults) => {
        if (mysqlError) {
          reject(mysqlError);
          return;
        }

        const mysqlCount = mysqlResults[0].count;

        // Kiểm tra kết quả trên cả hai cơ sở dữ liệu
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

const createNhanVien = async (req, res) => {
  const {
    reqMaNV,
    reqMaCN,
    reqMaCV,
    reqTenNV,
    reqNgaySinh,
    reqGioiTinh,
    reqDiachi,
    reqSdt,
  } = req.body;
  const insertQuery = `INSERT INTO nhanvien VALUES ('${reqMaNV}','${reqMaCN}','${reqMaCV}',N'${reqTenNV}', '${reqNgaySinh}','${reqGioiTinh}',N'${reqDiachi}','${reqSdt}')`;

  try {
    const maNVExists = await checkMaNV(reqMaNV);

    if (maNVExists) {
      res.status(400).json({ message: "Nhân viên đã tồn tại" });
      return;
    }

    // Tiến hành thêm nhân viên trên cả hai cơ sở dữ liệu
    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .json({ message: "Lỗi khi thêm nhân viên vào SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlInsertError) => {
          if (mysqlInsertError) {
            console.error(
              "Lỗi khi thêm nhân viên vào MySQL:",
              mysqlInsertError
            );
            res
              .status(500)
              .json({ message: "Lỗi khi thêm nhân viên vào MySQL" });
          } else {
            res.status(201).json({
              message: "Đồng bộ thêm nhân viên thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi tạo nhân viên",
    });
  }
};

// Hàm kiểm tra nhân viên
const checkNhanVien = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkQuery = `SELECT COUNT(*) AS count FROM NHANVIEN WHERE MaNV = '${id}'`;
      // Kiểm tra trên SQL Server
      const sqlCheckResult = await sqlPool.request().query(checkQuery);

      // Kiểm tra trên MySQL
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

const updateNhanVien = async (req, res) => {
  const id = req.params.id;
  const {
    reqMaCN,
    reqMaCV,
    reqTenNV,
    reqNgaySinh,
    reqGioiTinh,
    reqDiachi,
    reqSdt,
  } = req.body;
  const updateQuery = `UPDATE nhanvien set MACN='${reqMaCN}', MACV='${reqMaCV}', TENNV=N'${reqTenNV}', NGAYSINH = '${reqNgaySinh}', GIOITINH = '${reqGioiTinh}', DIACHI = N'${reqDiachi}', SDT = '${reqSdt}' where MANV = '${id}'`;

  try {
    const nvExists = await checkNhanVien(id);
    if (!nvExists) {
      res.status(400).send({ message: "Không tìm thấy nhân viên" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi thêm nhân viên ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mySqlError) => {
          if (mySqlError) {
            res.staus(500).send({ message: "Lỗi thêm nhân viên ở MySQL" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật nhân viên thành công!" });
          }
        });
      }
    });
  } catch (error) {
    res.staus(500).send({ message: "Cập nhật nhân viên không thành công!" });
  }
};

const deleteNhanVien = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM NHANVIEN WHERE MaNV = '${id}'`;
  try {
    const nvExists = await checkNhanVien(id);
    if (!nvExists) {
      res.status(400).send({ message: "Không tìm thấy nhân viên" });
      return;
    }

    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa nhân viên ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mySqlError) => {
          if (mySqlError) {
            res.staus(500).send({ message: "Lỗi khi xóa nhân viên ở MySQL" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa nhân viên thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.staus(500).send({ message: "Lỗi khi xóa nhân viên" });
  }
};
module.exports = {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
};

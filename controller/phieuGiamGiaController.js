const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllPHIEUGIAMGIA = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM PHIEUGIAMGIA";
    const allPHIEUGIAMGIA = await sqlPool.request().query(sqlQuery);
    const isPHIEUGIAMGIA = allPHIEUGIAMGIA.recordset.length;
    if (isPHIEUGIAMGIA > 0) {
      res.status(200).json(allPHIEUGIAMGIA.recordset);
    } else {
      res.json({ message: "Không có phiếu giảm giá" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getPHIEUGIAMGIAById = async (req, res) => {
  const id = req.params.id;
  try {
    const aPHIEUGIAMGIA = await sqlPool
      .request()
      .query(`SELECT * FROM PHIEUGIAMGIA WHERE MaGiamGia = '${id}'`);
    const count = aPHIEUGIAMGIA.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aPHIEUGIAMGIA.recordset);
    } else {
      res.send({ message: "phiếu giảm giá không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createPHIEUGIAMGIA = async (req, res) => {
  const {
    reqMaGiamGia,
    reqTenMaGG,
    reqGiaTriGiam,
    reqNgayApDung,
    reqNgayHetHan,
  } = req.body;
  const insertQuery = `INSERT INTO PHIEUGIAMGIA VALUES ('${reqMaGiamGia}',N'${reqTenMaGG}','${reqGiaTriGiam}','${reqNgayApDung}','${reqNgayHetHan}')`;
  const checkPHIEUGIAMGIA = `SELECT cOUNT(*) as count FROM PHIEUGIAMGIA WHERE MaGiamGia = '${reqMaGiamGia}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUGIAMGIA);
    if (TKExists) {
      res.send({ message: "phiếu giảm giá đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm phiếu giảm giá ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm phiếu giảm giá ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm phiếu giảm giá thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm phiếu giảm giá không thành công" });
  }
};

const updatePHIEUGIAMGIA = async (req, res) => {
  const id = req.params.id;
  const { reqTenMaGG, reqGiaTriGiam, reqNgayApDung, reqNgayHetHan } = req.body;
  const updateQuery = `UPDATE PHIEUGIAMGIA SET TenMaGG = N'${reqTenMaGG}', GiaTriGiam = '${reqGiaTriGiam}',NgayApDung = N'${reqNgayApDung}', NgayHetHan= '${reqNgayHetHan}' WHERE MaGiamGia = '${id}'`;
  const checkPHIEUGIAMGIA = `SELECT cOUNT(*) as count FROM PHIEUGIAMGIA WHERE MaGiamGia = '${id}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUGIAMGIA);
    if (TKExists) {
      res.send({ message: "Không tìm thấy phiếu giảm giá" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật phiếu giảm giá ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật phiếu giảm giá ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật phiếu giảm giá thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật phiếu giảm giá không thành công" });
  }
};

const deletePHIEUGIAMGIA = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM PHIEUGIAMGIA WHERE MaGiamGia = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM PHIEUGIAMGIA WHERE MaGiamGia = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy phiếu giảm giá" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa phiếu giảm giá ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa phiếu giảm giá ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa phiếu giảm giá thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllPHIEUGIAMGIA,
  getPHIEUGIAMGIAById,
  createPHIEUGIAMGIA,
  updatePHIEUGIAMGIA,
  deletePHIEUGIAMGIA,
};

const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllMATHANG = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM MATHANG";
    const allMATHANG = await sqlPool.request().query(sqlQuery);
    const isMATHANG = allMATHANG.recordset.length;
    if (isMATHANG > 0) {
      res.status(200).json(allMATHANG.recordset);
    } else {
      res.status(400).json({ message: "Không có mặt hàng" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getMATHANGById = async (req, res) => {
  const id = req.params.id;
  try {
    const aMATHANG = await sqlPool
      .request()
      .query(`SELECT * FROM MATHANG WHERE MAMH = '${id}'`);
    const count = aMATHANG.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aMATHANG.recordset);
    } else {
      res.status(400).send({ message: "mặt hàng không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createMATHANG = async (req, res) => {
  const {
    reqMaMH,
    reqMaLH,
    reqMaNSX,
    reqMaGiamGia,
    reqTenMH,
    reqGiamGia,
    reqMoTa,
    reqDVT,
  } = req.body;
  const insertQuery = `INSERT INTO MATHANG VALUES ('${reqMaMH}','${reqMaLH}','${reqMaNSX}','${reqMaGiamGia}',N'${reqTenMH}','${reqGiamGia}','${reqMoTa}','${reqDVT}')`;
  const checkMATHANG = `SELECT cOUNT(*) as count FROM MATHANG WHERE MAMH = '${reqMaMH}'`;

  try {
    const TMATHANGxists = await checkInsert(checkMATHANG);
    if (TMATHANGxists) {
      res.status(500).send({ message: "mặt hàng đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({ message: "Lỗi khi thêm mặt hàng ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({ message: "Lỗi khi thêm mặt hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm mặt hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm mặt hàng không thành công" });
  }
};

const updateMATHANG = async (req, res) => {
  const id = req.params.id;
  const {
    reqMaLH,
    reqMaNSX,
    reqMaGiamGia,
    reqTenMH,
    reqGiamGia,
    reqMoTa,
    reqDVT,
  } = req.body;
  const updateQuery = `UPDATE MATHANG SET MaLH = '${reqMaLH}', MaNSX = '${reqMaNSX}', MaGiamGia = '${reqMaGiamGia}',TenMH = N'${reqTenMH}',GiamGia = '${reqGiamGia}',MoTa = N'${reqMoTa}',DVT = '${reqDVT}' WHERE MAMH = '${id}'`;
  const checkMATHANG = `SELECT cOUNT(*) as count FROM MATHANG WHERE MAMH = '${id}'`;

  try {
    const TMATHANGxists = await checkInsert(checkMATHANG);
    if (!TMATHANGxists) {
      res.status(400).send({ message: "Không tìm thấy mặt hàng" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật mặt hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật mặt hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật mặt hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật mặt hàng không thành công" });
  }
};

const deleteMATHANG = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM MATHANG WHERE MAMH = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM MATHANG WHERE MAMH = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy mặt hàng" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa mặt hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa mặt hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa mặt hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllMATHANG,
  getMATHANGById,
  createMATHANG,
  updateMATHANG,
  deleteMATHANG,
};

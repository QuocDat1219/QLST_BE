const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllLOAIHANG = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM LOAIHANG";
    const allLOAIHANG = await sqlPool.request().query(sqlQuery);
    const isLOAIHANG = allLOAIHANG.recordset.length;
    if (isLOAIHANG > 0) {
      res.status(200).json(allLOAIHANG.recordset);
    } else {
      res.json({ message: "Không có loại hàng" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getLOAIHANGById = async (req, res) => {
  const id = req.params.id;
  try {
    const aLOAIHANG = await sqlPool
      .request()
      .query(`SELECT * FROM LOAIHANG WHERE MaLH = '${id}'`);
    const count = aLOAIHANG.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aLOAIHANG.recordset);
    } else {
      res.send({ message: "loại hàng không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createLOAIHANG = async (req, res) => {
  const { reqMaLH, reqTenLH } = req.body;
  const insertQuery = `INSERT INTO LOAIHANG VALUES ('${reqMaLH}',N'${reqTenLH}')`;
  const checkLOAIHANG = `SELECT cOUNT(*) as count FROM LOAIHANG WHERE MaLH = '${reqMaLH}'`;

  try {
    const TKExists = await checkInsert(checkLOAIHANG);
    if (TKExists) {
      res.send({ message: "loại hàng đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm loại hàng ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm loại hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm loại hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm loại hàng không thành công" });
  }
};

const updateLOAIHANG = async (req, res) => {
  const id = req.params.id;
  const { reqTenLH } = req.body;
  const updateQuery = `UPDATE LOAIHANG SET TenLH = N'${reqTenLH}' WHERE MaLH = '${id}'`;
  const checkLOAIHANG = `SELECT cOUNT(*) as count FROM LOAIHANG WHERE MaLH = '${id}'`;

  try {
    const TKExists = await checkInsert(checkLOAIHANG);
    if (!TKExists) {
      res.send({ message: "Không tìm thấy loại hàng" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật loại hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật loại hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật loại hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật loại hàng không thành công" });
  }
};

const deleteLOAIHANG = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM LOAIHANG WHERE MaLH = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM LOAIHANG WHERE MaLH = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (khoExists) {
      res.send({ message: "Không tìm thấy loại hàng" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa loại hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa loại hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa loại hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllLOAIHANG,
  getLOAIHANGById,
  createLOAIHANG,
  updateLOAIHANG,
  deleteLOAIHANG,
};

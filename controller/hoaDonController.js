const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllHOADON = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM HOADON";
    const allHOADON = await sqlPool.request().query(sqlQuery);
    const isHOADON = allHOADON.recordset.length;
    if (isHOADON > 0) {
      res.status(200).json(allHOADON.recordset);
    } else {
      res.status(400).json({ message: "Không có hóa đơn" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getHOADONById = async (req, res) => {
  const id = req.params.id;
  try {
    const aHOADON = await sqlPool
      .request()
      .query(`SELECT * FROM HOADON WHERE MaHD = '${id}'`);
    const count = aHOADON.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aHOADON.recordset);
    } else {
      res.status(400).send({ message: "hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createHOADON = async (req, res) => {
  const { reqMaHD, reqMaNV, reqMaKH, reqHinhThucTT, reqNgayLap } = req.body;
  const insertQuery = `INSERT INTO HOADON VALUES ('${reqMaHD}','${reqMaNV}','${reqMaKH}',N'${reqHinhThucTT}','${reqNgayLap}')`;
  const checkHOADON = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${reqMaHD}'`;

  try {
    const THOADONxists = await checkInsert(checkHOADON);
    if (THOADONxists) {
      res.status(500).send({ message: "hóa đơn đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({ message: "Lỗi khi thêm hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({ message: "Lỗi khi thêm hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm hóa đơn không thành công" });
  }
};

const updateHOADON = async (req, res) => {
  const id = req.params.id;
  const { reqMaNV, reqMaKH, reqHinhThucTT, reqNgayLap } = req.body;
  const updateQuery = `UPDATE HOADON SET MaNV = N'${reqMaNV}', MaKH = '${reqMaKH}',HinhThucTT = N'${reqHinhThucTT}',NgayLap = N'${reqNgayLap}' WHERE MaHD = '${id}'`;
  const checkHOADON = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${id}'`;

  try {
    const THOADONxists = await checkInsert(checkHOADON);
    if (!THOADONxists) {
      res.status(400).send({ message: "Không tìm thấy hóa đơn" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật hóa đơn không thành công" });
  }
};

const deleteHOADON = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM HOADON WHERE MaHD = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy hóa đơn" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa hóa đơn ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllHOADON,
  getHOADONById,
  createHOADON,
  updateHOADON,
  deleteHOADON,
};

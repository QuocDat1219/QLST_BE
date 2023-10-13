const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllCHITIETPHIEUNHAP = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM CHITIETPHIEUNHAP";
    const allCHITIETPHIEUNHAP = await sqlPool.request().query(sqlQuery);
    const isCHITIETPHIEUNHAP = allCHITIETPHIEUNHAP.recordset.length;
    if (isCHITIETPHIEUNHAP > 0) {
      res.status(200).json(allCHITIETPHIEUNHAP.recordset);
    } else {
      res.status(400).json({ message: "Không có chi tiết phiếu nhập" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getCHITIETPHIEUNHAPById = async (req, res) => {
  const id = req.params.id;
  try {
    const aCHITIETPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT * FROM CHITIETPHIEUNHAP WHERE MaPhieuNhap = '${id}'`);
    const count = aCHITIETPHIEUNHAP.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aCHITIETPHIEUNHAP.recordset);
    } else {
      res.status(400).send({ message: "chi tiết phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createCHITIETPHIEUNHAP = async (req, res) => {
  const {
    reqMaPhieuNhap,
    reqMaMH,
    reqGiaNhap,
    reqGiaBan,
    reqSoLuong,
    reqThanhTien,
  } = req.body;
  const insertQuery = `INSERT INTO CHITIETPHIEUNHAP VALUES ('${reqMaPhieuNhap}','${reqMaMH}','${reqGiaNhap}',N'${reqGiaBan}','${reqSoLuong}', '${reqThanhTien}')`;
  const checkCHITIETPHIEUNHAP = `SELECT cOUNT(*) as count FROM CHITIETPHIEUNHAP WHERE MaPhieuNhap = '${reqMaPhieuNhap}'`;

  try {
    const TKExists = await checkInsert(checkCHITIETPHIEUNHAP);
    if (TKExists) {
      res.status(500).send({ message: "chi tiết phiếu nhập đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi thêm chi tiết phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi thêm chi tiết phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm chi tiết phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Thêm chi tiết phiếu nhập không thành công" });
  }
};

const updateCHITIETPHIEUNHAP = async (req, res) => {
  const id = req.params.id;
  const { reqMaMH, reqGiaNhap, reqGiaBan, reqSoLuong, reqThanhTien } = req.body;
  const updateQuery = `UPDATE CHITIETPHIEUNHAP SET MaMH = '${reqMaMH}', GiaNhap = '${reqGiaNhap}',GiaBan = '${reqGiaBan}', SoLuong= '${reqSoLuong}',ThanhTien= '${reqThanhTien}' WHERE  MaPhieuNhap = '${id}'`;
  const checkCHITIETPHIEUNHAP = `SELECT cOUNT(*) as count FROM CHITIETPHIEUNHAP WHERE MaPhieuNhap = '${id}'`;

  try {
    const TKExists = await checkInsert(checkCHITIETPHIEUNHAP);
    if (!TKExists) {
      res.status(400).send({ message: "Không tìm thấy chi tiết phiếu nhập" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({
          message: "Lỗi khi cập nhật chi tiết phiếu nhập ở SQL Server",
        });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({
              message: "Lỗi khi cập nhật chi tiết phiếu nhập ở MySql",
            });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật chi tiết phiếu nhập thành công",
            });
          }
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Cập nhật chi tiết phiếu nhập không thành công" });
  }
};

const deleteCHITIETPHIEUNHAP = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM CHITIETPHIEUNHAP WHERE MaPhieuNhap = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM CHITIETPHIEUNHAP WHERE MaPhieuNhap = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy chi tiết phiếu nhập" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .send({ message: "Lỗi khi xóa chi tiết phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res
              .status(500)
              .send({ message: "Lỗi khi xóa chi tiết phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa chi tiết phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPById,
  createCHITIETPHIEUNHAP,
  updateCHITIETPHIEUNHAP,
  deleteCHITIETPHIEUNHAP,
};

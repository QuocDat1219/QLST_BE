const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllKE = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM KE";
    const allKE = await sqlPool.request().query(sqlQuery);
    const isKE = allKE.recordset.length;
    if (isKE > 0) {
      res.status(200).json(allKE.recordset);
    } else {
      res.status(400).json({ message: "Không có kệ hàng" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getKEById = async (req, res) => {
  const id = req.params.id;
  try {
    const aKE = await sqlPool
      .request()
      .query(`SELECT * FROM KE WHERE MaKe = '${id}'`);
    const count = aKE.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aKE.recordset);
    } else {
      res.status(400).send({ message: "kệ hàng không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createKE = async (req, res) => {
  const { reqMaKe, reqMaMH, reqTenKe, reqVitri } = req.body;
  const insertQuery = `INSERT INTO KE VALUES ('${reqMaKe}','${reqMaMH}','${reqTenKe}','${reqVitri}')`;
  const checkKE = `SELECT cOUNT(*) as count FROM KE WHERE MaKe = '${reqMaKe}'`;

  try {
    const TKExists = await checkInsert(checkKE);
    if (TKExists) {
      res.status(500).send({ message: "kệ hàng đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({ message: "Lỗi khi thêm kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({ message: "Lỗi khi thêm kệ hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm kệ hàng không thành công" });
  }
};

const updateKE = async (req, res) => {
  const id = req.params.id;
  const { reqMaMH, reqTenKe, reqVitri } = req.body;
  const updateQuery = `UPDATE KE SET MaMH = '${reqMaMH}', TenKe = N'${reqTenKe}', Vitri = N'${reqVitri}' WHERE MaKe = '${id}'`;
  const checkKE = `SELECT cOUNT(*) as count FROM KE WHERE MaKe = '${id}'`;

  try {
    const TKExists = await checkInsert(checkKE);
    if (!TKExists) {
      res.status(400).send({ message: "Không tìm thấy kệ hàng" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật kệ hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật kệ hàng không thành công" });
  }
};

const deleteKE = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM KE WHERE MaKe = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM KE WHERE MaKe = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy kệ hàng" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa kệ hàng ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllKE,
  getKEById,
  createKE,
  updateKE,
  deleteKE,
};

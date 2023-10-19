const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllKE = async (req, res) => {
  try {
    const sqlQuery =
      "select ke.MaKe as MaKe, mathang.TenMH as TenMH, ke.TenKe as TenKe, ke.Vitri as Vitri from ke inner join mathang on ke.MaMH = mathang.MaMH";
    const allKE = await sqlPool.request().query(sqlQuery);
    const isKE = allKE.recordset.length;
    if (isKE > 0) {
      res.status(200).json(allKE.recordset);
    } else {
      res.json({ message: "Không có kệ hàng" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
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
      res.send({ message: "kệ hàng không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createKE = async (req, res) => {
  const { reqMaKe, reqMaMH, reqTenKe, reqVitri } = req.body;
  const insertQuery = `INSERT INTO KE VALUES ('${reqMaKe}','${reqMaMH}','${reqTenKe}','${reqVitri}')`;
  const checkKE = `SELECT cOUNT(*) as count FROM KE WHERE MaKe = '${reqMaKe}'`;

  try {
    const TKExists = await checkInsert(checkKE);
    if (TKExists) {
      res.send({ message: "kệ hàng đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm kệ hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm kệ hàng không thành công" });
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
      res.send({ message: "Không tìm thấy kệ hàng" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật kệ hàng ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật kệ hàng không thành công" });
  }
};

const deleteKE = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM KE WHERE MaKe = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM KE WHERE MaKe = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy kệ hàng" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa kệ hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa kệ hàng ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa kệ hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllKE,
  getKEById,
  createKE,
  updateKE,
  deleteKE,
};

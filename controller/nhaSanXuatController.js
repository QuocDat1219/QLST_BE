const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllNHASANXUAT = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM NHASANXUAT";
    const allNHASANXUAT = await sqlPool.request().query(sqlQuery);
    const isNHASANXUAT = allNHASANXUAT.recordset.length;
    if (isNHASANXUAT > 0) {
      res.status(200).json(allNHASANXUAT.recordset);
    } else {
      res.status(400).json({ message: "Không có nhà sản xuất" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getNHASANXUATById = async (req, res) => {
  const id = req.params.id;
  try {
    const aNHASANXUAT = await sqlPool
      .request()
      .query(`SELECT * FROM NHASANXUAT WHERE MaNsx = '${id}'`);
    const count = aNHASANXUAT.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aNHASANXUAT.recordset);
    } else {
      res.status(400).send({ message: "nhà sản xuất không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createNHASANXUAT = async (req, res) => {
  const { reqMaNsx, reqTenNsx, reqDiachi, reqSdt } = req.body;
  const insertQuery = `INSERT INTO NHASANXUAT VALUES ('${reqMaNsx}',N'${reqTenNsx}',N'${reqDiachi}','${reqSdt}')`;
  const checkNHASANXUAT = `SELECT cOUNT(*) as count FROM NHASANXUAT WHERE MaNsx = '${reqMaNsx}'`;

  try {
    const TKExists = await checkInsert(checkNHASANXUAT);
    if (TKExists) {
      res.status(500).send({ message: "nhà sản xuất đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi thêm nhà sản xuất ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi thêm nhà sản xuất ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm nhà sản xuất thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm nhà sản xuất không thành công" });
  }
};

const updateNHASANXUAT = async (req, res) => {
  const id = req.params.id;
  const { reqTenNsx, reqDiachi, reqSdt } = req.body;
  const updateQuery = `UPDATE NHASANXUAT SET TenNsx = N'${reqTenNsx}', Diachi = N'${reqDiachi}',Sdt = N'${reqSdt}' WHERE MaNsx = '${id}'`;
  const checkNHASANXUAT = `SELECT cOUNT(*) as count FROM NHASANXUAT WHERE MaNsx = '${id}'`;

  try {
    const TKExists = await checkInsert(checkNHASANXUAT);
    if (!TKExists) {
      res.status(400).send({ message: "Không tìm thấy nhà sản xuất" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật nhà sản xuất ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật nhà sản xuất ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật nhà sản xuất thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật nhà sản xuất không thành công" });
  }
};

const deleteNHASANXUAT = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM NHASANXUAT WHERE MaNsx = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM NHASANXUAT WHERE MaNsx = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkTK);
    if (!khoExists) {
      res.status(400).send({ message: "Không tìm thấy nhà sản xuất" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .send({ message: "Lỗi khi xóa nhà sản xuất ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res
              .status(500)
              .send({ message: "Lỗi khi xóa nhà sản xuất ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa nhà sản xuất thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllNHASANXUAT,
  getNHASANXUATById,
  createNHASANXUAT,
  updateNHASANXUAT,
  deleteNHASANXUAT,
};

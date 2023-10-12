const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllBoPhan = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM BOPHAN";
    const allCV = await sqlPool.request().query(sqlQuery);
    const isCV = allCV.recordset.length;
    if (isCV > 0) {
      res.status(200).json(allCV.recordset);
    } else {
      res.status(400).json({ message: "Không có bộ phận" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getBoPhanById = async (req, res) => {
  const id = req.params.id;
  try {
    const aBOPHAN = await sqlPool
      .request()
      .query(`SELECT * FROM BOPHAN WHERE MaBP = '${id}'`);
    const count = aBOPHAN.recordset.length;
    if (count > 0) {
      res.status(200).json(aBOPHAN.recordset);
    } else {
      res.status(400).send({ message: "bộ phận không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createBoPhan = async (req, res) => {
  const { reqMaBP, reqTenBP } = req.body;
  const insertQuery = `INSERT INTO BOPHAN VALUES ('${reqMaBP}',N'${reqTenBP}')`;
  const checkBOPHAN = `SELECT cOUNT(*) as count FROM BOPHAN WHERE MaBP = '${reqMaBP}'`;
  try {
    const CVExists = await checkInsert(checkBOPHAN);
    if (CVExists) {
      res.status(500).send({ message: "Bộ phận đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({ message: "Lỗi khi thêm bộ phận ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({ message: "Lỗi khi thêm bộ phận ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm bộ phận thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm bộ phận không thành công" });
  }
};

const updateBoPhan = async (req, res) => {
  const id = req.params.id;
  const { reqTenBP } = req.body;
  const updateQuery = `UPDATE BOPHAN SET TenBP = N'${reqTenBP}' WHERE MaBP = '${id}'`;
  const checkBOPHAN = `SELECT cOUNT(*) as count FROM BOPHAN WHERE MaBP = '${id}'`;
  try {
    const CVExists = await checkInsert(checkBOPHAN);
    if (!CVExists) {
      res.status(400).send({ message: "Không tìm thấy bộ phận" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật bộ phận ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật bộ phận ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật bộ phận thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật bộ phận không thành công" });
  }
};

const deleteBoPhan = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM BOPHAN WHERE MaBP = '${id}'`;
  const checkBOPHAN = `SELECT cOUNT(*) as count FROM BOPHAN WHERE MaBP = '${id}'`;

  try {
    const CVExists = await checkUpdate(checkBOPHAN);
    if (!CVExists) {
      res.status(400).send({ message: "Không tìm thấy bộ phận" });
      return;
    }

    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa bộ phận ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa bộ phận ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa bộ phận thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllBoPhan,
  getBoPhanById,
  createBoPhan,
  updateBoPhan,
  deleteBoPhan,
};

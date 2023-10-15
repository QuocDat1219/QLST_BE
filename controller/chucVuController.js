const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllChucVu = async (req, res) => {
  try {
    const sqlQuery =
      "select chucvu.MaCV as MaCV, bophan.TenBP as TenBP, chucvu.TenCV as TenCV from chucvu inner join bophan on chucvu.MaBP = bophan.MaBP";
    const allCV = await sqlPool.request().query(sqlQuery);
    const isCV = allCV.recordset.length;
    if (isCV > 0) {
      res.status(200).json(allCV.recordset);
    } else {
      res.status(400).json({ message: "Không có chức vụ" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getChucVuById = async (req, res) => {
  const id = req.params.id;
  try {
    const aChucVu = await sqlPool
      .request()
      .query(`SELECT * FROM CHUCVU WHERE MaCV = '${id}'`);
    const count = aChucVu.recordset.length;
    if (count > 0) {
      res.status(200).json(aChucVu.recordset);
    } else {
      res.status(400).send({ message: "Chức vụ không tồn tại" });
    }
  } catch (error) {
    res.status(500).send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createChucVu = async (req, res) => {
  const { reqMaCV, reqMaBP, reqTenCV } = req.body;
  const insertQuery = `INSERT INTO CHUCVU VALUES ('${reqMaCV}','${reqMaBP}',N'${reqTenCV}')`;
  const checkChucVu = `SELECT cOUNT(*) as count FROM CHUCVU WHERE MaCV = '${reqMaCV}'`;
  try {
    const CVExists = await checkInsert(checkChucVu);
    if (CVExists) {
      res.status(500).send({ message: "Chức vụ đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.status(500).send({ message: "Lỗi khi thêm chức vụ ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.status(500).send({ message: "Lỗi khi thêm chức vụ ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm chức vụ thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Thêm chức vụ không thành công" });
  }
};

const updateChucVu = async (req, res) => {
  const id = req.params.id;
  const { reqMaBP, reqTenCV } = req.body;
  const updateQuery = `UPDATE CHUCVU SET MaBP = '${reqMaBP}',TenCV = N'${reqTenCV}' WHERE MaCV = '${id}'`;
  const checkChucVu = `SELECT cOUNT(*) as count FROM CHUCVU WHERE MaCV = '${id}'`;
  try {
    const CVExists = await checkInsert(checkChucVu);
    if (!CVExists) {
      res.status(400).send({ message: "Không tìm thấy chức vụ" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res
          .status(500)
          .send({ message: "Lỗi khi cập nhật chức vụ ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res
              .status(500)
              .send({ message: "Lỗi khi cập nhật chức vụ ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật chức vụ thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Cập nhật chức vụ không thành công" });
  }
};

const deleteChucVu = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM CHUCVU WHERE MaCV = '${id}'`;
  const checkChucVu = `SELECT cOUNT(*) as count FROM CHUCVU WHERE MaCV = '${id}'`;

  try {
    const CVExists = await checkUpdate(checkChucVu);
    if (!CVExists) {
      res.status(400).send({ message: "Không tìm thấy chức vụ" });
      return;
    }

    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.status(500).send({ message: "Lỗi khi xóa chức vụ ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.status(500).send({ message: "Lỗi khi xóa chức vụ ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa chức vụ thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllChucVu,
  getChucVuById,
  createChucVu,
  updateChucVu,
  deleteChucVu,
};

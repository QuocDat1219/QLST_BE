const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkUpdate } = require("../auth/checkInfomation");

const getChiNhanh = async (req, res) => {
  try {
    // Sử dụng sqlPool để thực hiện truy vấn trên SQL Server
    const sqlQuery = "SELECT * FROM chinhanh";
    const result = await sqlPool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    res.json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getChiNhanhById = async (req, res) => {
  try {
    const sqlQuery = `SELECT * FROM CHINHANH WHERE MaCN = '${req.params.id}'`;
    const aChiNhanh = await sqlPool.request().query(sqlQuery);

    if (aChiNhanh.recordset.length > 0) {
      res.status(200).json(aChiNhanh.recordset);
    } else {
      res.send({ error: "Không tìm thấy chi nhánh!" });
    }
  } catch (error) {
    console.error(error);
    res.send({ error: "Lỗi truy vấn cơ sở dữ liệu!" });
  }
};

const updateChiNhanh = async (req, res) => {
  const id = req.params.id;
  const { reqTenCN, reqDiaChi, reqSDT } = req.body;

  // Tạo lệnh truy vấn chung
  const updateQuery = `UPDATE CHINHANH set TenCN='${reqTenCN}', DiaChi='${reqDiaChi}', Sdt='${reqSDT}' WHERE MaCN='${id}'`;
  const checkChiNhanh = `SELECT cOUNT(*) as count FROM CHINHANH WHERE MaCN = '${id}'`;

  try {
    const CNExists = await checkUpdate(checkChiNhanh);
    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }

    // Sửa ở cả 2 cơ sở dữ liệu
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        res.json({ error: "Lỗi khi cập nhật chi nhánh trên SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi cập nhật chi nhánh trên MySQL:", mysqlError);
            res.json({ error: "Lỗi khi cập nhật chi nhánh trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ error: "Cập nhật không thành công!" });
  }
};

const deleteChiNhanh = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM CHINHANH WHERE MaCN = '${id}'`;
  const checkChiNhanh = `SELECT COUNT(*) AS COUNT FROM CHINHANH WHERE MaCN='${id}'`;

  try {
    const CNExists = await checkInsert(checkChiNhanh);
    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }
    // thực hiện xóa
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.json({ error: "Lỗi khi xóa chi nhánh trên SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi xóa chi nhánh trên MySQL:", mysqlError);
            res.json({ error: "Lỗi khi xóa chi nhánh trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ xóa thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    res.json({ error: "Xóa không thành công!" });
  }
};
module.exports = {
  getChiNhanh,
  getChiNhanhById,
  updateChiNhanh,
  deleteChiNhanh,
};

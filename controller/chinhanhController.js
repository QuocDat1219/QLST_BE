const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");

const getChiNhanh = async (req, res) => {
  try {
    // Sử dụng sqlPool để thực hiện truy vấn trên SQL Server
    const sqlQuery = "SELECT * FROM chinhanh";
    const result = await sqlPool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getChiNhanhById = async (req, res) => {
  try {
    const sqlQuery = `SELECT * FROM CHINHANH WHERE MaCN = '${req.params.id}'`;
    const aChiNhanh = await sqlPool.request().query(sqlQuery);

    if (aChiNhanh.recordset.length > 0) {
      res.status(200).json(aChiNhanh.recordset);
    } else {
      res.status(500).send({ error: "Không tìm thấy chi nhánh!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Lỗi truy vấn cơ sở dữ liệu!" });
  }
};

const createChiNhanh = async (req, res) => {
  const { reqMaCN, reqTenCN, reqDiaChi, reqSDT } = req.body;

  const sqlQuery = `INSERT INTO ChiNhanh (MaCN, TenCN, DiaChi, Sdt) VALUES ('${reqMaCN}', N'${reqTenCN}', N'${reqDiaChi}', '${reqSDT}')`;

  try {
    // Kiểm tra xem mã chi nhánh đã tồn tại trong SQL Server
    const sqlCheckQuery = `SELECT COUNT(*) AS count FROM ChiNhanh WHERE MaCN = '${reqMaCN}'`;
    const sqlCheckResult = await sqlPool.request().query(sqlCheckQuery);

    // Kiểm tra xem mã chi nhánh đã tồn tại trong MySQ

    mysqlConnection.query(sqlCheckQuery, (mysqlError, mysqlResults) => {
      if (mysqlError) {
        console.error("Lỗi khi kiểm tra mã chi nhánh trên MySQL:", mysqlError);
        res
          .status(500)
          .json({ error: "Lỗi khi kiểm tra mã chi nhánh trên MySQL" });
        return;
      }

      const mysqlCount = mysqlResults[0].count;
      // Kiểm tra kết quả trên cả hai cơ sở dữ liệu
      if (sqlCheckResult.recordset[0].count > 0 && mysqlCount > 0) {
        // Mã chi nhánh đã tồn tại trong ít nhất một cơ sở dữ liệu, từ chối thêm chi nhánh mới
        res.status(400).json({ error: "Mã chi nhánh đã tồn tại" });
      } else if (sqlCheckResult.recordset[0].count == 0 && mysqlCount > 0) {
        sqlPool.request().query(sqlQuery);
        res.status(201).json({
          message: "Thêm chi nhánh thành công!",
        });
      } else {
        // Mã chi nhánh không tồn tại trên cả hai cơ sở dữ liệu, tiến hành thêm

        sqlPool.request().query(sqlQuery, (sqlError) => {
          if (sqlError) {
            res.status(500).json({ error: "Chi nhánh đã tồn tại trên site!" });
          } else {
            mysqlConnection.query(sqlQuery, (mysqlInsertError) => {
              if (mysqlInsertError) {
                console.error(
                  "Lỗi khi thêm chi nhánh vào MySQL:",
                  mysqlInsertError
                );
                res
                  .status(500)
                  .json({ error: "Chi nhánh đã tồn tại trên server!" });
              } else {
                res.status(201).json({
                  message: "Đồng bộ thêm chi nhánh thành công!",
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error,
      error: "Lỗi khi tạo chi nhánh",
    });
  }
};

// Hàm kiểm tra mã chi nhánh trên cả MySQL và SQL Server
const checkMaCN = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra trên SQL Server
      const sqlCheckQuery = `SELECT COUNT(*) AS count FROM ChiNhanh WHERE MaCN = '${id}'`;
      const sqlCheckResult = await sqlPool.request().query(sqlCheckQuery);

      // Kiểm tra trên MySQL
      const mysqlCheckQuery = `SELECT COUNT(*) AS count FROM chiNhanh WHERE MaCN = '${id}'`;

      mysqlConnection.query(mysqlCheckQuery, (mysqlError, mysqlResults) => {
        if (mysqlError) {
          reject(mysqlError);
          return;
        }

        const mysqlCount = mysqlResults[0].count;

        // Kiểm tra kết quả trên cả hai cơ sở dữ liệu
        if (sqlCheckResult.recordset[0].count > 0 || mysqlCount > 0) {
          resolve(true); // Mã chi nhánh tồn tại
        } else {
          resolve(false); // Mã chi nhánh không tồn tại
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateChiNhanh = async (req, res) => {
  const id = req.params.id;
  const { reqTenCN, reqDiaChi, reqSDT } = req.body;

  // Tạo lệnh truy vấn chung
  const updateQuery = `UPDATE CHINHANH set TenCN='${reqTenCN}', DiaChi='${reqDiaChi}', Sdt='${reqSDT}' WHERE MaCN='${id}'`;

  try {
    const CNExists = await checkMaCN(id);

    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }

    // Sửa ở cả 2 cơ sở dữ liệu
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .json({ error: "Lỗi khi cập nhật chi nhánh trên SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi cập nhật chi nhánh trên MySQL:", mysqlError);
            res
              .status(500)
              .json({ error: "Lỗi khi cập nhật chi nhánh trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Cập nhật không thành công!" });
  }
};

const deleteChiNhanh = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM CHINHANH WHERE MaCN = '${id}'`;
  try {
    const CNExists = await checkMaCN(id);
    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }
    // thực hiện xóa
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res
          .status(500)
          .json({ error: "Lỗi khi xóa chi nhánh trên SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi xóa chi nhánh trên MySQL:", mysqlError);
            res.status(500).json({ error: "Lỗi khi xóa chi nhánh trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ xóa công!",
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Xóa không thành công!" });
  }
};
module.exports = {
  getChiNhanh,
  getChiNhanhById,
  createChiNhanh,
  updateChiNhanh,
  deleteChiNhanh,
};

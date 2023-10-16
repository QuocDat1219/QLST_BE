const mysql = require("mysql2");
const { mysqlConnection } = require("../model/connect_mysql");

const loginMysql = async (req, res) => {
  const { host, username, password } = req.body;

  const mysqlConfig = {
    host: host,
    user: username,
    password: password,
  };

  const connection = mysql.createConnection(mysqlConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Lỗi kết nối Server:", err);
      res.send({ error: "Lỗi kết nối Server" });
      return;
    }

    // Thực hiện truy vấn để lấy danh sách cơ sở dữ liệu
    connection.query("SHOW DATABASES", (queryError, results) => {
      if (queryError) {
        console.error("Lỗi truy vấn MySQL:", queryError);
        res.send({ error: "Lỗi truy vấn MySQL" });
        return;
      }

      // Đóng kết nối
      connection.end();

      const databases = results.map((row) => row.Database);

      res.status(200).json({ databases });
    });
  });
};

const getTable = async (req, res) => {
  const databasename = req.params.databasename;
  try {
    if (databasename === "qlst") {
      mysqlConnection.query("SHOW FULL TABLES", (queryError, results) => {
        if (queryError) {
          console.error("Lỗi truy vấn MySQL:", queryError);
          res.send({ error: "Lỗi truy vấn MySQL" });
          return;
        }
        const table = results.map((row) => Object.values(row)[0]);

        res.status(200).json({ table });
      });
    } else {
      res.send({ error: "Cở sở dữ liệu này không hỗ trợ phân tán" });
    }
  } catch (error) {
    res.send({ error: "Lỗi truy vấn cơ sở dữ liệu: " + error.message });
  }
};

const getColumnOfTable = async (req, res) => {
  const tableName = req.params.table;
  try {
    mysqlConnection.query(
      `SHOW COLUMNS FROM ${tableName}`,
      (queryError, results) => {
        if (queryError) {
          console.error("Lỗi truy vấn MySQL:", queryError);
          res.send({ error: "Lỗi truy vấn MySQL" });
          return;
        }
        const columns = results.map((row) => Object.values(row)[0]);
        res.status(200).json({ columns });
      }
    );
  } catch (error) {}
};

const getDieuKienViTu = async (req, res) => {
  try {
    mysqlConnection.query(
      `SELECT MaCV, TenCV FROM chucvu`,
      (queryError, results) => {
        if (queryError) {
          console.error("Lỗi truy vấn MySQL:", queryError);
          res.send({ error: "Lỗi truy vấn MySQL" });
          return;
        }
        res.status(200).json({ results });
      }
    );
  } catch (error) {}
};
module.exports = {
  loginMysql,
  getTable,
  getColumnOfTable,
  getDieuKienViTu,
};

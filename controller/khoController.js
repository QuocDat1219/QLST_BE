const { request } = require("express");
const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");
const getAllKho = async (req, res) => {
  try {
    const allKho = await sqlPool
      .request()
      .query(
        "select kho.MaKho as MaKho, chinhanh.TenCN as TenCN, kho.TenKho as TenKho, kho.DiaChi as DiaChi from kho inner join chinhanh on kho.MaCN = chinhanh.MaCN"
      );
    const count = allKho.recordset.length;
    if (count > 0) {
      res.status(200).json(allKho.recordset);
    } else {
      res.send({ message: "Không tìm thấy kho" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getKhoById = async (req, res) => {
  const id = req.params.id;
  try {
    const aKho = await sqlPool
      .request()
      .query(`SELECT * FROM KHO WHERE MaKho = '${id}'`);
    const count = aKho.recordset.length;
    if (count > 0) {
      res.status(200).json(aKho.recordset);
    } else {
      res.send({ message: "Kho không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createKho = async (req, res) => {
  const { reqMaKho, reqMaCN, reqTenKho, reqDiaChi } = req.body;
  const insertQuery = `INSERT INTO kho VALUES ('${reqMaKho}','${reqMaCN}',N'${reqTenKho}',N'${reqDiaChi}')`;
  const checkKho = `SELECT cOUNT(*) as count FROM kho WHERE MaKho = '${reqMaKho}'`;
  try {
    const khoExists = await checkInsert(checkKho);
    if (khoExists) {
      res.send({ message: "Kho đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm kho ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm kho ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ thêm kho thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm kho không thành công" });
  }
};

const updateKho = async (req, res) => {
  const id = req.params.id;
  const { reqMaCN, reqTenKho, reqDiaChi } = req.body;
  const updateKho = `UPDATE kho SET MaCN = '${reqMaCN}',TenKho = N'${reqTenKho}',DiaChi = N'${reqDiaChi}' WHERE MaKho = '${id}'`;
  const checkKho = `SELECT cOUNT(*) as count FROM kho WHERE MaKho = '${id}'`;

  try {
    const khoExists = await checkUpdate(checkKho);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy kho" });
      return;
    }

    sqlPool.request().query(updateKho, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi cập nhật kho ở SQL Server" });
      } else {
        mysqlConnection.query(updateKho, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật kho ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật kho thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật không thành công" });
  }
};

const deleteKho = async (req, res) => {
  const id = req.params.id;
  const deleteteKho = `DELETE FROM KHO WHERE MaKho = '${id}'`;
  const checkKho = `SELECT cOUNT(*) as count FROM kho WHERE MaKho = '${id}'`;

  try {
    const khoExists = await checkInsert(checkKho);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy kho" });
      return;
    }

    sqlPool.request().query(deleteteKho, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa kho ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteKho, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa kho ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa kho thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};
module.exports = {
  getAllKho,
  getKhoById,
  createKho,
  updateKho,
  deleteKho,
};

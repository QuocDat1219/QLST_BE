const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");
const getAllKhachHang = async (req, res) => {
  try {
    const selectQuery =
      "select kh.MaKH as MaKH, cn.TenCN as TenCN, kh.TenKH as TenKH, kh.NgaySinh as NgaySinh,kh.GioiTinh as GioiTinh, kh.Diachi as Diachi,kh.Sdt as Sdt from khachhang kh inner join chinhanh cn on kh.MaCN = cn.MaCN";
    const allKhachHang = await sqlPool.request().query(selectQuery);
    if (allKhachHang.recordset.length > 0) {
      res.status(200).json(allKhachHang.recordset);
    } else {
      res.send({ message: "Không có khách hàng!" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getKhachHangById = async (req, res) => {
  const id = req.params.id;
  try {
    const selectQuery = `SELECT * FROM KHACHHANG WHERE MaKH = '${id}'`;
    const aKhachHang = await sqlPool.request().query(selectQuery);
    if (aKhachHang.recordset.length > 0) {
      res.status(200).json(aKhachHang.recordset);
    } else {
      res.send({ message: "Không tìm thấy khách hàng này!" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createKhachHang = async (req, res) => {
  const {
    reqMaKH,
    reqMaCN,
    reqTenKH,
    reqNgaySinh,
    reqGioiTinh,
    reqDiaChi,
    reqSdt,
  } = req.body;
  const insertQuery = `INSERT INTO KHACHHANG VALUES('${reqMaKH}', '${reqMaCN}', N'${reqTenKH}', '${reqNgaySinh}', '${reqGioiTinh}', N'${reqDiaChi}', '${reqSdt}')`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MaKH = '${reqMaKH}'`;
  try {
    const khExists = await checkInsert(checkKhachHang);
    if (khExists) {
      res.send({ message: "Khách hàng đã tồn tại!" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi thêm khách hàng ở SQL Server " });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm khách hàng ở Mysql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm khách hàng thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Thêm khách hàng không thành công" });
  }
};

const updateKhachHang = async (req, res) => {
  const id = req.params.id;
  const { reqMaCN, reqTenKH, reqNgaySinh, reqGioiTinh, reqDiaChi, reqSdt } =
    req.body;
  const updateQuery = `UPDATE KHACHHANG SET MACN = '${reqMaCN}', TENKH = N'${reqTenKH}', NGAYSINH = '${reqNgaySinh}', GIOITINH = '${reqGioiTinh}', DIACHI = N'${reqDiaChi}', SDT = '${reqSdt}' WHERE MAKH = '${id}'`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MaKH = '${id}'`;
  try {
    const khExists = await checkUpdate(checkKhachHang);
    if (!khExists) {
      res.send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi cập nhật khách hàng ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (sqlError) => {
          if (sqlError) {
            res.send({ message: "Lỗi khi cập nhật khách hàng ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ cập nhật thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Cập nhật không thành công" });
  }
};

const deleteKhachHang = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM KHACHHANG WHERE MAKH = '${id}'`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MaKH = '${id}'`;
  try {
    const khExists = await checkUpdate(checkKhachHang);
    if (!khExists) {
      res.send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi xóa khách hàng ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (sqlError) => {
          if (sqlError) {
            res.send({ message: "Lỗi khi xóa khách hàng ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ xóa thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};
module.exports = {
  getAllKhachHang,
  getKhachHangById,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
};

const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllPhieuNhap = async (req, res) => {
  try {
    const sqlQuery =
      "select pn.MaPhieuNhap as MaPhieuNhap, nv.TenNV as TenNV, kho.TenKho as TenKho, pn.DVT as DVT,pn.NgayLapPhieu as NgayLapPhieu from phieunhap pn inner join nhanvien nv on pn.MaNV = nv.MaNV inner join kho on pn.MaKho = kho.MaKho";
    const allPHIEUNHAP = await sqlPool.request().query(sqlQuery);
    const isPHIEUNHAP = allPHIEUNHAP.recordset.length;
    if (isPHIEUNHAP > 0) {
      res.status(200).json(allPHIEUNHAP.recordset);
    } else {
      res.json({ message: "Không có phiếu nhập" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getPhieuNhapById = async (req, res) => {
  const id = req.params.id;
  try {
    const aPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT * FROM PHIEUNHAP WHERE MaPhieuNhap = '${id}'`);
    const count = aPHIEUNHAP.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aPHIEUNHAP.recordset);
    } else {
      res.send({ message: "Phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createPhieuNhap = async (req, res) => {
  const { reqMaPhieuNhap, reqMaNV, reqMaKho, reqDVT, reqNgayLapPhieu } =
    req.body;
  const insertQuery = `INSERT INTO PHIEUNHAP VALUES ('${reqMaPhieuNhap}','${reqMaNV}','${reqMaKho}',N'${reqDVT}','${reqNgayLapPhieu}')`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE MaPhieuNhap = '${reqMaPhieuNhap}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (TKExists) {
      res.send({ message: "Phiếu nhập đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm phiếu nhập không thành công" });
  }
};

const updatePhieuNhap = async (req, res) => {
  const id = req.params.id;
  const { reqMaNV, reqMaKho, reqDVT, reqNgayLapPhieu } = req.body;
  const updateQuery = `UPDATE PHIEUNHAP SET MaNV = '${reqMaNV}', MaKho = '${reqMaKho}',DVT = N'${reqDVT}', NgayLapPhieu= '${reqNgayLapPhieu}'WHERE MaPhieuNhap = '${id}'`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE MaPhieuNhap = '${id}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (!TKExists) {
      res.send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật phiếu nhập không thành công" });
  }
};

const deletePhieuNhap = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM PHIEUNHAP WHERE MaPhieuNhap = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM PHIEUNHAP WHERE MaPhieuNhap = '${id}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllPhieuNhap,
  getPhieuNhapById,
  createPhieuNhap,
  updatePhieuNhap,
  deletePhieuNhap,
};

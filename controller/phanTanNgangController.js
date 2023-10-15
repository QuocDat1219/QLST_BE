const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");

const phanTanNgang = async (req, res) => {
  const { bang, cot, dieukien, bangvitu1, cotvitu1, dieukienvitu1 } = req.body;
  let vitu = "";
  if (bangvitu1 || cotvitu1 || dieukienvitu1) {
    vitu = `SELECT nv.* into ${bangvitu1} FROM ${bang} cn inner join OPENQUERY(MYSQL, 'SELECT nv.* FROM ${bangvitu1} nv') nv on cn.MaCN=nv.MaCN Where nv.${cotvitu1} = '${dieukienvitu1}'`;
  } else {
    vitu =
      "SELECT nv.* into nhanvien FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT nv.* FROM nhanvien nv') nv on cn.MaCN=nv.MaCN";
  }
  if (bang || cot || dieukien) {
    try {
      const phanTanQueries = [
        //   --Tạo bảng chi nhánh---
        `SELECT * into ${bang} FROM OPENQUERY(MYSQL, 'SELECT * FROM ${bang}  Where ${cot} = N''${dieukien}''')`,

        "alter table chinhanh add constraint pri_key_cn primary key (MaCN)",

        //   --Tạo bảng nhân viên---

        vitu,

        "alter table nhanvien add constraint pri_key_nv primary key (MaNV)",

        "alter table nhanvien add constraint FK_cn_nv foreign key (MaCN) references chinhanh(MaCN)",

        //   --Tạo bảng tài khoản --
        "SELECT tk.* into taikhoan FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT tk.* FROM taikhoan tk')tk ON nv.MaNV = tk.MaNV",

        "alter table taikhoan add constraint pri_key_tk primary key (TenTK)",

        "alter table taikhoan add constraint fk_nv_tk foreign key (MaNV) references nhanvien(MaNV)",

        //   --Tạo bảng khách hàng--
        "SELECT kh.* into khachhang FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT kh.* FROM khachhang kh')kh on cn.MaCN=kh.MaCN",

        "alter table khachhang add constraint pri_key_kh primary key (MaKH)",

        "alter table khachhang add constraint FK_cn_kh foreign key (MaCN) references chinhanh(MaCN)",

        //   --Tạo bảng kho---
        "SELECT kho.* into kho FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT kho.* FROM kho kho')kho on cn.MaCN=kho.MaCN ",

        "alter table kho add constraint pri_key_kho primary key (MaKho)",

        "alter table kho add constraint FK_cn_kho foreign key (MaCN) references chinhanh(MaCN)",

        //   --Tạo bảng chức vụ---
        "SELECT cv.* into chucvu FROM nhanvien nv inner join OPENQUERY(MYSQL, 'SELECT cv.* FROM chucvu cv') cv ON nv.MaCV = cv.MaCV",

        "alter table chucvu add constraint pri_key_cvv primary key (MaCV)",

        "alter table nhanvien add constraint FK_nv_cv foreign key (MaCV) references chucvu(MaCV)",

        //   --Tạo bảng Bộ phận--
        "SELECT bp.* into bophan FROM chucvu cv JOIN OPENQUERY(MYSQL, 'SELECT bp.* FROM bophan bp') bp ON cv.MaBP = bp.MaBP",

        "alter table bophan add constraint pri_key_bp primary key (MaBP)",

        "alter table chucvu add constraint FK_cv_bp foreign key (MaBP) references bophan(MaBP)",

        //   --Tạo bảng hóa đơn--
        "SELECT hd.* into hoadon FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT hd.* FROM hoadon hd') hd ON nv.MaNV = hd.MaNV",

        "alter table hoadon add constraint pri_key_hd primary key (MaHD)",

        "alter table hoadon add constraint fk_hd_nv foreign key (MaNV) references nhanvien(MaNV)",

        //   --Tạo bảng Chi tiết hóa đơn--
        "SELECT cthd.* into chitiethoadon FROM hoadon hd inner JOIN OPENQUERY(MYSQL, 'SELECT cthd.* FROM chitiethoadon cthd') cthd ON cthd.MaHD = hd.MAHD",

        "alter table chitiethoadon add constraint pri_key_ct primary key (MaHD,MaMH)",

        "alter table chitiethoadon add constraint FK_cthd_hd foreign key (MaHD) references hoadon(MaHD)",

        //   --Tạo bảng mặt hàng--
        "SELECT mh.* into mathang FROM chitiethoadon cthd inner JOIN OPENQUERY(MYSQL, 'SELECT mh.* FROM mathang mh') mh ON cthd.MaMH = mh.MaMH",

        "alter table mathang add constraint pri_key_mh primary key (MaMH)",

        "alter table chitiethoadon add constraint FK_cthd_mh foreign key (MaMH) references mathang(MaMH)",

        //   --Tạo bảng loại hàng--
        "SELECT lh.* into loaihang FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT lh.* FROM loaihang lh')lh ON mh.MaLH = lh.MaLH",

        "alter table loaihang add constraint pri_key_lh primary key (MaLH)",

        "alter table mathang add constraint FK_mh_lh foreign key (MaLH) references loaihang(MaLH)",

        //   --Tạo bảng nhà sản xuất--
        "SELECT nsx.* into nhasanxuat FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT nsx.* FROM nhasanxuat nsx')nsx ON nsx.MaNsx = mh.MaNsx group by nsx.MaNsx,nsx.TenNsx,nsx.DiaChi,nsx.Sdt",

        "alter table nhasanxuat add constraint pri_key_nsx primary key (MaNsx)",

        "alter table mathang add constraint FK_mh_nsx foreign key (MaNsx) references nhasanxuat(MaNsx)",

        //   --Tạo bảng phiếu giảm giá--
        "SELECT mgg.* into phieugiamgia FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT mgg.* FROM phieugiamgia mgg')mgg ON mh.MaGiamGia = mgg.MaGiamGia",

        "alter table phieugiamgia add constraint pri_key_pg primary key (MaGiamGia)",

        "alter table mathang add constraint fk_mh_pgg foreign key (MaGiamGia) references phieugiamgia(MaGiamGia)",

        //   --Tạo bảng kệ--
        "SELECT k.* into ke from mathang mh inner join OPENQUERY(MYSQL, 'Select k.* from ke k') k on mh.MaMH=k.MaMH",

        "alter table ke add constraint pri_key_ke primary key (MaKe)",

        "alter table ke add constraint fk_ke_mh foreign key (MaMH) references mathang(MaMH)",

        //   --Tạo bảng phiếu nhập--
        "SELECT pn.* into phieunhap FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT pn.* FROM phieunhap pn')pn ON nv.MaNV = pn.MaNV",

        "alter table phieunhap add constraint pri_key_pn primary key (MaPhieuNhap)",

        "alter table phieunhap add constraint fk_pn_nv foreign key (MaNV) references nhanvien(MaNV)",

        "alter table phieunhap add constraint fk_pn_kho foreign key (MaKho) references kho(MaKho)",

        //   --Tạo bảng chi tiết phiếu nhập--
        "SELECT ctpn.* into chitietphieunhap FROM phieunhap pn JOIN OPENQUERY(MYSQL, 'SELECT ctpn.* FROM chitietphieunhap ctpn')ctpn ON ctpn.MaPhieuNhap = pn.MaPhieuNhap",

        "alter table chitietphieunhap add constraint pri_key_ctpn primary key (MaPhieuNhap,MaMH)",

        "alter table chitietphieunhap add constraint fk_ctpn_h foreign key (MaMH) references mathang(MaMH)",

        "alter table chitietphieunhap add constraint fk_ctpn_pn foreign key (MaPhieuNhap) references phieunhap(MaPhieuNhap)",
      ];
      for (const sqlQuery of phanTanQueries) {
        await sqlPool.query(sqlQuery);
      }

      res.status(200).json({ message: "success" });
    } catch (error) {
      console.error("Lỗi khi thực hiện các lệnh SQL:", error);
      res.status(500).send({ message: "error" });
    }
  } else {
    res.status(500).send({ message: "error" });
  }
};

module.exports = {
  phanTanNgang,
};

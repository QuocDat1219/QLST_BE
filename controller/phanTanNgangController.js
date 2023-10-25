const { sqlPool } = require("../model/connect_sqlserver");
const { mysqlConnection } = require("../model/connect_mysql");
const { executeOracleQuery } = require("../model/connect_oracle");

const phanTanNgang = async (req, res) => {
  const { bang, cot, phantan, bangvitu1, cotvitu1, dieukienvitu1 } = req.body;
  let vitu,
    vitu1,
    taikhoanvitu,
    hoadonvitu,
    phieunhapvitu,
    ctphieunhapvitu,
    cthoadonvitu = "";
  if (bangvitu1 || cotvitu1 || dieukienvitu1) {
    vitu = `SELECT nv.* into ${bangvitu1} FROM ${bang} cn inner join OPENQUERY(MYSQL, 'SELECT nv.* FROM ${bangvitu1} nv') nv on cn.MaCN=nv.MaCN Where nv.${cotvitu1} = '${dieukienvitu1}'`;
    vitu1 = `SELECT nv.* FROM nhanvien nv 
         INNER JOIN chucvu cv ON nv.MaCV = cv.MaCV 
         INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN 
         WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}'`;

    taikhoanvitu = `SELECT tk.* FROM taikhoan tk 
                INNER JOIN nhanvien nv ON tk.MaNV = nv.MaNV 
                INNER JOIN chucvu cv ON nv.MaCV = cv.MaCV 
                INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN 
                WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}'`;

    hoadonvitu = `SELECT hd.* FROM hoadon hd 
              INNER JOIN nhanvien nv ON hd.MaNV = nv.MaNV 
              INNER JOIN chucvu cv ON nv.MaCV = cv.MaCV 
              INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN 
              WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}'`;

    phieunhapvitu = `SELECT pn.* FROM phieunhap pn 
                 INNER JOIN kho ON pn.MaKho = kho.MaKho 
                 INNER JOIN nhanvien nv ON pn.MaNV = nv.MaNV 
                 INNER JOIN chucvu cv ON cv.MaCV = nv.MaCV 
                 INNER JOIN chinhanh cn ON cn.MaCN = kho.MaCN 
                 WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}' 
                 GROUP BY kho.MaKho`;

    ctphieunhapvitu = `SELECT ctn.* FROM chitietphieunhap ctn 
                   INNER JOIN phieunhap pn ON ctn.MaPhieuNhap = pn.MaPhieuNhap 
                   INNER JOIN nhanvien nv ON pn.MaNV = nv.MaNV 
                   INNER JOIN chucvu cv ON nv.MaCV = cv.MaCV 
                   INNER JOIN kho ON kho.MaKho = pn.MaKho 
                   INNER JOIN chinhanh cn ON kho.MaCN = cn.MaCN 
                   WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}'`;

    cthoadonvitu = `SELECT cth.* FROM chitiethoadon cth 
                INNER JOIN hoadon hd ON cth.MaHD = hd.MaHD 
                INNER JOIN nhanvien nv ON hd.MaNV = nv.MaNV 
                INNER JOIN chucvu cv ON nv.MaCV = cv.MaCV 
                INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN 
                WHERE cn.${cot}='${phantan}' AND cv.${cotvitu1}='${dieukienvitu1}'`;
  } else {
    vitu =
      "SELECT nv.* into nhanvien FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT nv.* FROM nhanvien nv') nv on cn.MaCN=nv.MaCN";
    vitu1 = `SELECT nv.* FROM nhanvien nv INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}='${phantan}'`;

    taikhoanvitu = `SELECT tk.* FROM taikhoan tk INNER JOIN nhanvien nv ON tk.MaNV = nv.MaNV INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}='${phantan}'`;

    hoadonvitu = `SELECT hd.* FROM hoadon hd INNER JOIN nhanvien nv ON hd.MaNV = nv.MaNV INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}='${phantan}'`;

    phieunhapvitu = `SELECT pn.* FROM phieunhap pn INNER JOIN kho ON pn.MaKho = kho.MaKho INNER JOIN chinhanh cn ON cn.MaCN = kho.MaCN WHERE cn.${cot}='${phantan}'`;

    ctphieunhapvitu = `SELECT ctn.* FROM chitietphieunhap ctn INNER JOIN phieunhap pn ON ctn.MaPhieuNhap = pn.MaPhieuNhap INNER JOIN kho ON kho.MaKho = pn.MaKho INNER JOIN chinhanh cn ON kho.MaCN = cn.MaCN WHERE cn.${cot}='${phantan}'`;

    cthoadonvitu = `SELECT cth.* FROM chitiethoadon cth INNER JOIN hoadon hd ON cth.MaHD = hd.MaHD INNER JOIN nhanvien nv ON hd.MaNV = nv.MaNV INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}='${phantan}'`;
  }
  if (bang || cot || dieukien) {
    const tanchinh = `Select ${bang}.* from ${bang} where ${cot} = '${phantan}'`;
    console.log(tanchinh);
    //Tán bảng chi nhánh
    const resultcn = await mysqlConnection.promise().query(tanchinh);
    const [resultsCN] = resultcn;
    if (resultsCN.length > 0) {
      const checkTableQuery1 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CHINHANH'";
      const result1 = await executeOracleQuery(checkTableQuery1);
      const tableCount1 = result1.rows[0][0];

      if (tableCount1 > 0) {
        console.log("Bảng chi nhánh đã tồn tại");
      } else {
        const oracleQuery1 =
          "CREATE TABLE chinhanh (MaCN varchar2(20), TenCN varchar2(50), DiaChi varchar2(50), Sdt varchar2(11))";
        await executeOracleQuery(oracleQuery1);
      }

      for (const row of resultsCN) {
        const MaCN = row.MaCN;
        const TenCN = row.TenCN;
        const DiaChi = row.DiaChi;
        const Sdt = row.Sdt;

        const insertQuery1 =
          "INSERT INTO chinhanh (MaCN, TenCN, DiaChi, Sdt) VALUES (:MaCN, :TenCN, :DiaChi, :Sdt)";
        const insertParams1 = [MaCN, TenCN, DiaChi, Sdt];
        await executeOracleQuery(insertQuery1, insertParams1);
      }

      const alterQuery1 =
        "ALTER TABLE chinhanh ADD CONSTRAINT pk_chinhanh PRIMARY KEY (MaCN)";
      await executeOracleQuery(alterQuery1);
    }

    //Phân tán bảng nhân viên
    const resultnv = await mysqlConnection.promise().query(vitu1);
    const [resultnvs] = resultnv;

    if (resultnvs.length > 0) {
      const checkTableQuery2 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'NHANVIEN'";
      const result2 = await executeOracleQuery(checkTableQuery2);
      const tableCount2 = result2.rows[0][0];

      if (tableCount2 > 0) {
        console.log("Bảng nhân viên đã tồn tại");
      } else {
        const oracleQuery2 =
          "CREATE TABLE nhanvien (MaNV varchar2(20), MaCN varchar2(20), TenNV varchar2(50), NgaySinh date, GioiTinh varchar2(50), Diachi varchar2(50), Sdt varchar2(50), MaCV varchar2(20))";
        await executeOracleQuery(oracleQuery2);
      }

      for (const row of resultnvs) {
        const MaNV = row.MaNV;
        const MaCN = row.MaCN;
        const TenNV = row.TenNV;
        const NgaySinh = row.NgaySinh;
        const GioiTinh = row.GioiTinh;
        const Diachi = row.Diachi;
        const Sdt = row.Sdt;
        const MaCV = row.MaCV;

        const insertQuery2 =
          "INSERT INTO nhanvien (MaNV, MaCN, TenNV, NgaySinh, GioiTinh, Diachi, Sdt, MaCV) VALUES (:MaNV, :MaCN, :TenNV, :NgaySinh, :GioiTinh, :Diachi, :Sdt, :MaCV)";
        const insertParams2 = [
          MaNV,
          MaCN,
          TenNV,
          NgaySinh,
          GioiTinh,
          Diachi,
          Sdt,
          MaCV,
        ];
        await executeOracleQuery(insertQuery2, insertParams2);
      }

      const alterQuery3 =
        "ALTER TABLE nhanvien ADD CONSTRAINT pk_nhanvien PRIMARY KEY (MaNV)";
      await executeOracleQuery(alterQuery3);

      const alterQuery4 =
        "ALTER TABLE nhanvien ADD CONSTRAINT fk_nhanvien_CN FOREIGN KEY (MaCN) REFERENCES chinhanh(MaCN)";
      await executeOracleQuery(alterQuery4);
    }

    //Phân tán khách hàng
    const resultKH = await mysqlConnection
      .promise()
      .query(
        `select kh.* from khachhang kh inner join chinhanh cn on kh.MaCN = cn.MaCN where cn.${cot}='${phantan}'`
      );
    const [reusltkhs] = resultKH;
    if (reusltkhs.length > 0) {
      const checkTableQuery3 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'KHACHHANG'";
      const result3 = await executeOracleQuery(checkTableQuery3);
      const tableCount3 = result3.rows[0][0];

      if (tableCount3 > 0) {
        console.log("Bảng khách hàng đã tồn tại");
      } else {
        const oracleQuery3 =
          "CREATE TABLE khachhang (MaKH varchar2(20), MaCN varchar2(20), TenKH varchar2(50), NgaySinh date, GioiTinh varchar2(50), Diachi varchar2(50), Sdt varchar2(50))";
        await executeOracleQuery(oracleQuery3);
      }

      for (const row of reusltkhs) {
        const MaKH = row.MaKH;
        const MaCN = row.MaCN;
        const TenKH = row.TenKH;
        const NgaySinh = row.NgaySinh;
        const GioiTinh = row.GioiTinh;
        const Diachi = row.Diachi;
        const Sdt = row.Sdt;

        const insertQuery3 =
          "INSERT INTO khachhang VALUES (:MaKH, :MaCN, :TenKH, :NgaySinh, :GioiTinh, :Diachi, :Sdt)";
        const insertParams3 = [
          MaKH,
          MaCN,
          TenKH,
          NgaySinh,
          GioiTinh,
          Diachi,
          Sdt,
        ];
        await executeOracleQuery(insertQuery3, insertParams3);
      }

      const alterPKKhachHang =
        "ALTER TABLE khachhang ADD CONSTRAINT pk_khachhang PRIMARY KEY (MaKH)";
      await executeOracleQuery(alterPKKhachHang);

      const alterFKkh =
        "ALTER TABLE khachhang ADD CONSTRAINT fk_khachhang_CN FOREIGN KEY (MaCN) REFERENCES chinhanh(MaCN) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterFKkh);
    }

    //Phân tán bảng kho
    const resultKho = await mysqlConnection
      .promise()
      .query(
        `select kho.* from kho inner join chinhanh cn on kho.MaCN = cn.MaCN where cn.${cot} = '${phantan}'`
      );
    const [khoResults] = resultKho;
    if (khoResults.length > 0) {
      const checkTableQuery4 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'KHO'";
      const result4 = await executeOracleQuery(checkTableQuery4);
      const tableCount4 = result4.rows[0][0];

      if (tableCount4 > 0) {
        console.log("Bảng kho đã tồn tại");
      } else {
        const oracleQuery4 =
          "CREATE TABLE kho (MaKho varchar2(20), MaCN varchar2(20), TenKho varchar2(50), DiaChi varchar2(50))";
        await executeOracleQuery(oracleQuery4);
      }

      for (const row of khoResults) {
        const MaKho = row.MaKho;
        const MaCN = row.MaCN;
        const TenKho = row.TenKho;
        const DiaChi = row.DiaChi;

        const insertQuery4 =
          "INSERT INTO kho VALUES (:MaKho, :MaCN, :TenKho, :DiaChi)";
        const insertParams4 = [MaKho, MaCN, TenKho, DiaChi];
        await executeOracleQuery(insertQuery4, insertParams4);
      }

      const alterQuery441 =
        "ALTER TABLE kho ADD CONSTRAINT pk_kho PRIMARY KEY (MaKho)";
      await executeOracleQuery(alterQuery441);

      const alterQuery442 =
        "ALTER TABLE kho ADD CONSTRAINT fk_kho_CN FOREIGN KEY (MaCN) REFERENCES chinhanh(MaCN) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterQuery442);
    }

    //Phân tán tài khoản
    const taiKhoanResult = await mysqlConnection.promise().query(taikhoanvitu);
    const [taiKhoanResults] = taiKhoanResult;
    if (taiKhoanResults.length > 0) {
      const checkTableQuery5 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'TAIKHOAN'";
      const result5 = await executeOracleQuery(checkTableQuery5);
      const tableCount5 = result5.rows[0][0];

      if (tableCount5 > 0) {
        console.log("Bảng tài khoản đã tồn tại");
      } else {
        const oracleQuery5 =
          "CREATE TABLE taikhoan (TenTK varchar2(50), MaNV varchar2(20), Matkhau varchar2(50), Quyen number)";
        await executeOracleQuery(oracleQuery5);
      }

      for (const row of taiKhoanResults) {
        const TenTK = row.TenTK;
        const MaNV = row.MaNV;
        const Matkhau = row.Matkhau;
        const Quyen = row.Quyen;

        const insertQuery5 =
          "INSERT INTO taikhoan VALUES (:TenTK, :MaNV, :Matkhau, :Quyen)";
        const insertParams5 = [TenTK, MaNV, Matkhau, Quyen];
        await executeOracleQuery(insertQuery5, insertParams5);
      }

      const alterQuery551 =
        "ALTER TABLE taikhoan ADD CONSTRAINT pk_taikhoan PRIMARY KEY (TenTK)";
      await executeOracleQuery(alterQuery551);

      const alterQuery552 =
        "ALTER TABLE taikhoan ADD CONSTRAINT fk_TK_Nv FOREIGN KEY (MaNV) REFERENCES nhanvien(MaNV) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterQuery552);
    }

    //Phân tán chức vụ
    const mysqlQueryChucVu = `SELECT cv.* FROM chucvu cv INNER JOIN nhanvien nv ON cv.MaCV = nv.MaCV INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}=N'${phantan}'`;
    const CVresult = await mysqlConnection.promise().query(mysqlQueryChucVu);
    const [CVresults] = CVresult;
    const checkTableQueryChucVu =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CHUCVU'";
    const resultChucVu = await executeOracleQuery(checkTableQueryChucVu);
    const tableCountChucVu = resultChucVu.rows[0][0];

    if (tableCountChucVu > 0) {
      console.log("Bảng chức vụ đã tồn tại");
    } else {
      const oracleQueryChucVu =
        "CREATE TABLE chucvu (MaCV varchar2(20), MaBP varchar2(20), TenCV varchar2(50))";
      await executeOracleQuery(oracleQueryChucVu);

      for (const row of CVresults) {
        const MaCV = row.MaCV;
        const MaBP = row.MaBP;
        const TenCV = row.TenCV;

        const insertQueryChucVu =
          "INSERT INTO chucvu VALUES (:MaCV, :MaBP, :TenCV)";
        const insertParamsChucVu = [MaCV, MaBP, TenCV];
        await executeOracleQuery(insertQueryChucVu, insertParamsChucVu);
      }

      const alterQueryChucVu_PRI =
        "ALTER TABLE chucvu ADD CONSTRAINT pk_chucvu PRIMARY KEY (MaCV)";
      await executeOracleQuery(alterQueryChucVu_PRI);

      const alterQueryChucVu_FK_NV =
        "ALTER TABLE nhanvien ADD CONSTRAINT fk_CV_Nv FOREIGN KEY (MaCV) REFERENCES chucvu(MaCV)";
      await executeOracleQuery(alterQueryChucVu_FK_NV);
    }

    //Phân tán bộ phận
    const mysqlQueryBoPhan = `SELECT bp.* FROM bophan bp INNER JOIN chucvu cv ON bp.MaBP = cv.MaBP INNER JOIN nhanvien nv ON cv.MaCV = nv.MaCV INNER JOIN chinhanh cn ON nv.MaCN = cn.MaCN WHERE cn.${cot}=N'${phantan}'`;
    const boPhanResult = await mysqlConnection
      .promise()
      .query(mysqlQueryBoPhan);
    const [boPhanResults] = boPhanResult;

    const checkTableQueryBoPhan =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'BOPHAN'";
    const resultBoPhan = await executeOracleQuery(checkTableQueryBoPhan);
    const tableCountBoPhan = resultBoPhan.rows[0][0];

    if (tableCountBoPhan > 0) {
      console.log("Bảng bộ phận đã tồn tại");
    } else {
      const oracleQueryBoPhan =
        "CREATE TABLE bophan (MaBP varchar2(20), TenBP varchar2(50))";
      await executeOracleQuery(oracleQueryBoPhan);

      for (const row of boPhanResults) {
        const MaBP = row.MaBP;
        const TenBP = row.TenBP;

        const insertQueryBoPhan = "INSERT INTO bophan VALUES (:MaBP, :TenBP)";
        const insertParamsBoPhan = [MaBP, TenBP];
        await executeOracleQuery(insertQueryBoPhan, insertParamsBoPhan);
      }

      const alterQueryBoPhan_PRI =
        "ALTER TABLE bophan ADD CONSTRAINT pk_bophan PRIMARY KEY (MaBP)";
      await executeOracleQuery(alterQueryBoPhan_PRI);

      const alterQueryBoPhan_FK_CV =
        "ALTER TABLE chucvu ADD CONSTRAINT fk_CV_BP FOREIGN KEY (MaBP) REFERENCES bophan(MaBP)";
      await executeOracleQuery(alterQueryBoPhan_FK_CV);
    }

    //Phân tán hóa đơn
    const hoaDonResult = await mysqlConnection.promise().query(hoadonvitu);
    const [hoaDonResults] = hoaDonResult;
    if (hoaDonResults.length > 0) {
      const checkTableQuery8 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'HOADON'";
      const result8 = await executeOracleQuery(checkTableQuery8);
      const tableCount8 = result8.rows[0][0];

      if (tableCount8 > 0) {
        console.log("Bảng hóa đơn đã tồn tại");
      } else {
        const oracleQuery8 =
          "CREATE TABLE hoadon (MaHD varchar2(20), MaNV varchar2(20), MaKH varchar2(20), HinhThucTT varchar2(50), NgayLap date, GhiChu varchar2(50))";
        await executeOracleQuery(oracleQuery8);
      }

      for (const row of hoaDonResults) {
        const MaHD = row.MaHD;
        const MaNV = row.MaNV;
        const MaKH = row.MaKH;
        const HinhThucTT = row.HinhThucTT;
        const NgayLap = row.NgayLap;
        const GhiChu = row.GhiChu;

        const insertQuery8 =
          "INSERT INTO hoadon VALUES (:MaHD, :MaNV, :MaKH, :HinhThucTT, :NgayLap, :GhiChu)";
        const insertParams8 = [MaHD, MaNV, MaKH, HinhThucTT, NgayLap, GhiChu];
        await executeOracleQuery(insertQuery8, insertParams8);
      }

      const alterQuery881 =
        "ALTER TABLE hoadon ADD CONSTRAINT pk_hoadon PRIMARY KEY (MaHD)";
      await executeOracleQuery(alterQuery881);

      const alterQuery882 =
        "ALTER TABLE hoadon ADD CONSTRAINT fk_KH_HD FOREIGN KEY (MaKH) REFERENCES khachhang(MaKH) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterQuery882);

      const alterQuery883 =
        "ALTER TABLE hoadon ADD CONSTRAINT fk_NV_HD FOREIGN KEY (MaNV) REFERENCES nhanvien(MaNV)";
      await executeOracleQuery(alterQuery883);
    }

    //Phân tán phiếu nhập
    const phieuNhapResult = await mysqlConnection
      .promise()
      .query(phieunhapvitu);
    const [phieuNhapResults] = phieuNhapResult;
    if (phieuNhapResults.length > 0) {
      const checkTableQuery9 =
        "SELECT COUNT(*) FROM user_tables WHERE table_name = 'PHIEUNHAP'";
      const result9 = await executeOracleQuery(checkTableQuery9);
      const tableCount9 = result9.rows[0][0];

      if (tableCount9 > 0) {
        console.log("Bảng phiếu nhập đã tồn tại");
      } else {
        const oracleQuery9 =
          "CREATE TABLE phieunhap (MaPhieuNhap varchar2(20), MaNV varchar2(20), MaKho varchar2(20), DVT varchar2(50), NgayLapPhieu date)";
        await executeOracleQuery(oracleQuery9);
      }

      for (const row of phieuNhapResults) {
        const MaPhieuNhap = row.MaPhieuNhap;
        const MaNV = row.MaNV;
        const MaKho = row.MaKho;
        const DVT = row.DVT;
        const NgayLapPhieu = row.NgayLapPhieu;

        const insertQuery9 =
          "INSERT INTO phieunhap VALUES (:MaPhieuNhap, :MaNV, :MaKho, :DVT, :NgayLapPhieu)";
        const insertParams9 = [MaPhieuNhap, MaNV, MaKho, DVT, NgayLapPhieu];
        await executeOracleQuery(insertQuery9, insertParams9);
      }

      const alterQuery991 =
        "ALTER TABLE phieunhap ADD CONSTRAINT pk_phieunhap PRIMARY KEY (MaPhieuNhap)";
      await executeOracleQuery(alterQuery991);

      const alterQuery992 =
        "ALTER TABLE phieunhap ADD CONSTRAINT fk_NV_PN FOREIGN KEY (MaNV) REFERENCES nhanvien(MaNV) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterQuery992);

      const alterQuery993 =
        "ALTER TABLE phieunhap ADD CONSTRAINT fk_KHO_PN FOREIGN KEY (MaKho) REFERENCES kho(MaKho) DEFERRABLE INITIALLY DEFERRED";
      await executeOracleQuery(alterQuery993);
    }

    //Phân tán chi nhánh
    // try {
    //   const phanTanQueries = [
    //     //   --Tạo bảng chi nhánh---
    //     `SELECT * into ${bang} FROM OPENQUERY(MYSQL, 'SELECT * FROM ${bang}  Where ${cot} = N''${dieukien}''')`,
    //     "alter table chinhanh add constraint pri_key_cn primary key (MaCN)",
    //     //   --Tạo bảng nhân viên---
    //     vitu,
    //     "alter table nhanvien add constraint pri_key_nv primary key (MaNV)",
    //     "alter table nhanvien add constraint FK_cn_nv foreign key (MaCN) references chinhanh(MaCN)",
    //     //   --Tạo bảng tài khoản --
    //     "SELECT tk.* into taikhoan FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT tk.* FROM taikhoan tk')tk ON nv.MaNV = tk.MaNV",
    //     "alter table taikhoan add constraint pri_key_tk primary key (TenTK)",
    //     "alter table taikhoan add constraint fk_nv_tk foreign key (MaNV) references nhanvien(MaNV)",
    //     //   --Tạo bảng khách hàng--
    //     "SELECT kh.* into khachhang FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT kh.* FROM khachhang kh')kh on cn.MaCN=kh.MaCN",
    //     "alter table khachhang add constraint pri_key_kh primary key (MaKH)",
    //     "alter table khachhang add constraint FK_cn_kh foreign key (MaCN) references chinhanh(MaCN)",
    //     //   --Tạo bảng kho---
    //     "SELECT kho.* into kho FROM chinhanh cn inner join OPENQUERY(MYSQL, 'SELECT kho.* FROM kho kho')kho on cn.MaCN=kho.MaCN ",
    //     "alter table kho add constraint pri_key_kho primary key (MaKho)",
    //     "alter table kho add constraint FK_cn_kho foreign key (MaCN) references chinhanh(MaCN)",
    //     //   --Tạo bảng chức vụ---
    //     "SELECT cv.* into chucvu FROM nhanvien nv inner join OPENQUERY(MYSQL, 'SELECT cv.* FROM chucvu cv') cv ON nv.MaCV = cv.MaCV",
    //     "alter table chucvu add constraint pri_key_cvv primary key (MaCV)",
    //     "alter table nhanvien add constraint FK_nv_cv foreign key (MaCV) references chucvu(MaCV)",
    //     //   --Tạo bảng Bộ phận--
    //     "SELECT bp.* into bophan FROM chucvu cv JOIN OPENQUERY(MYSQL, 'SELECT bp.* FROM bophan bp') bp ON cv.MaBP = bp.MaBP",
    //     "alter table bophan add constraint pri_key_bp primary key (MaBP)",
    //     "alter table chucvu add constraint FK_cv_bp foreign key (MaBP) references bophan(MaBP)",
    //     //   --Tạo bảng hóa đơn--
    //     "SELECT hd.* into hoadon FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT hd.* FROM hoadon hd') hd ON nv.MaNV = hd.MaNV",
    //     "alter table hoadon add constraint pri_key_hd primary key (MaHD)",
    //     "alter table hoadon add constraint fk_hd_nv foreign key (MaNV) references nhanvien(MaNV)",
    //     //   --Tạo bảng Chi tiết hóa đơn--
    //     "SELECT cthd.* into chitiethoadon FROM hoadon hd inner JOIN OPENQUERY(MYSQL, 'SELECT cthd.* FROM chitiethoadon cthd') cthd ON cthd.MaHD = hd.MAHD",
    //     "alter table chitiethoadon add constraint pri_key_ct primary key (MaHD,MaMH)",
    //     "alter table chitiethoadon add constraint FK_cthd_hd foreign key (MaHD) references hoadon(MaHD)",
    //     //   --Tạo bảng mặt hàng--
    //     "SELECT mh.* into mathang FROM chitiethoadon cthd inner JOIN OPENQUERY(MYSQL, 'SELECT mh.* FROM mathang mh') mh ON cthd.MaMH = mh.MaMH",
    //     "alter table mathang add constraint pri_key_mh primary key (MaMH)",
    //     "alter table chitiethoadon add constraint FK_cthd_mh foreign key (MaMH) references mathang(MaMH)",
    //     //   --Tạo bảng loại hàng--
    //     "SELECT lh.* into loaihang FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT lh.* FROM loaihang lh')lh ON mh.MaLH = lh.MaLH",
    //     "alter table loaihang add constraint pri_key_lh primary key (MaLH)",
    //     "alter table mathang add constraint FK_mh_lh foreign key (MaLH) references loaihang(MaLH)",
    //     //   --Tạo bảng nhà sản xuất--
    //     "SELECT nsx.* into nhasanxuat FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT nsx.* FROM nhasanxuat nsx')nsx ON nsx.MaNsx = mh.MaNsx group by nsx.MaNsx,nsx.TenNsx,nsx.DiaChi,nsx.Sdt",
    //     "alter table nhasanxuat add constraint pri_key_nsx primary key (MaNsx)",
    //     "alter table mathang add constraint FK_mh_nsx foreign key (MaNsx) references nhasanxuat(MaNsx)",
    //     //   --Tạo bảng phiếu giảm giá--
    //     "SELECT mgg.* into phieugiamgia FROM mathang mh inner JOIN OPENQUERY(MYSQL, 'SELECT mgg.* FROM phieugiamgia mgg')mgg ON mh.MaGiamGia = mgg.MaGiamGia",
    //     "alter table phieugiamgia add constraint pri_key_pg primary key (MaGiamGia)",
    //     "alter table mathang add constraint fk_mh_pgg foreign key (MaGiamGia) references phieugiamgia(MaGiamGia)",
    //     //   --Tạo bảng kệ--
    //     "SELECT k.* into ke from mathang mh inner join OPENQUERY(MYSQL, 'Select k.* from ke k') k on mh.MaMH=k.MaMH",
    //     "alter table ke add constraint pri_key_ke primary key (MaKe)",
    //     "alter table ke add constraint fk_ke_mh foreign key (MaMH) references mathang(MaMH)",
    //     //   --Tạo bảng phiếu nhập--
    //     "SELECT pn.* into phieunhap FROM nhanvien nv inner JOIN OPENQUERY(MYSQL, 'SELECT pn.* FROM phieunhap pn')pn ON nv.MaNV = pn.MaNV",
    //     "alter table phieunhap add constraint pri_key_pn primary key (MaPhieuNhap)",
    //     "alter table phieunhap add constraint fk_pn_nv foreign key (MaNV) references nhanvien(MaNV)",
    //     "alter table phieunhap add constraint fk_pn_kho foreign key (MaKho) references kho(MaKho)",
    //     //   --Tạo bảng chi tiết phiếu nhập--
    //     "SELECT ctpn.* into chitietphieunhap FROM phieunhap pn JOIN OPENQUERY(MYSQL, 'SELECT ctpn.* FROM chitietphieunhap ctpn')ctpn ON ctpn.MaPhieuNhap = pn.MaPhieuNhap",
    //     "alter table chitietphieunhap add constraint pri_key_ctpn primary key (MaPhieuNhap,MaMH)",
    //     "alter table chitietphieunhap add constraint fk_ctpn_h foreign key (MaMH) references mathang(MaMH)",
    //     "alter table chitietphieunhap add constraint fk_ctpn_pn foreign key (MaPhieuNhap) references phieunhap(MaPhieuNhap)",
    //   ];
    //   for (const sqlQuery of phanTanQueries) {
    //     await sqlPool.query(sqlQuery);
    //   }
    //   res.status(200).json({ message: "success" });
    // } catch (error) {
    //   console.error("Lỗi khi thực hiện các lệnh SQL:", error);
    //   res.status(300).send({ message: "error" });
    // }

    res.status(200).json({ message: "Phân tán thành công" });
  } else {
    res.status(300).send({ message: "error" });
  }
};

module.exports = {
  phanTanNgang,
};

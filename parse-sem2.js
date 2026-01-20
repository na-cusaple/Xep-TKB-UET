const fs = require('fs');

// Đọc file HTML
const htmlContent = fs.readFileSync('sem2.html', 'utf-8');

// Trích xuất các dòng dữ liệu từ bảng
const rows = [];
const tableRegex = /<tbody>([\s\S]*?)<\/tbody>/g;
const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;

const tableMatch = tableRegex.exec(htmlContent);
if (tableMatch) {
    const tbody = tableMatch[1];
    let rowMatch;
    let rowIndex = 0;
    
    while ((rowMatch = rowRegex.exec(tbody)) !== null) {
        const rowHtml = rowMatch[1];
        const cells = [];
        let cellMatch;
        
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            let cellContent = cellMatch[1];
            // Xóa các thẻ HTML và trim
            cellContent = cellContent.replace(/<[^>]*>/g, '').trim();
            cells.push(cellContent);
        }
        
        // Bỏ qua hàng tiêu đề và hàng trống
        if (cells.length > 0 && rowIndex > 0) {
            rows.push(cells);
        }
        rowIndex++;
    }
}

console.log('Tổng số dòng dữ liệu:', rows.length);
if (rows.length > 0) {
    console.log('\nVí dụ dòng đầu tiên:');
    console.log(JSON.stringify(rows[0], null, 2));
    console.log('\nVí dụ dòng thứ hai:');
    console.log(JSON.stringify(rows[1], null, 2));
}

// Tạo dữ liệu JSON
const subjects = rows.map((row, index) => {
    return {
        "stt": String(index + 1),
        "ma_hoc_phan": row[1] || "",
        "hoc_phan": row[2] || "",
        "so_tin_chi": parseInt(row[3]) || 0,
        "ma_lhp": row[4] || "",
        "giang_vien": row[5] || "",
        "so_sv_du_kien": row[6] || "",
        "thu": row[7] || "",
        "tiet": row[8] || "",
        "giang_duong": row[9] || "",
        "nhom": row[10] || "",
        "ghi_chu": row[11] || ""
    };
});

// Tạo nội dung file data.js mới
const outputContent = `// Dữ liệu thời khóa biểu UET HKII 2025-2026
// Được tạo tự động từ file HTML Google Sheets - Phiên bản v2 (Fixed column mapping)
// Format: STT, Mã học phần, Học phần, Số tín chỉ, Mã LHP, Giảng viên, Số SV dự kiến, Thứ, Tiết, Giảng đường, Nhóm, Ghi chú

const UET_SUBJECTS_DATA = ${JSON.stringify(subjects, null, 2)};

// Xuất dữ liệu để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UET_SUBJECTS_DATA;
}
`;

fs.writeFileSync('data.js', outputContent, 'utf-8');
console.log('\nĐã cập nhật file data.js với', subjects.length, 'môn học');

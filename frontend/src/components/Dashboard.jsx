import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // 1. STATE: Lưu danh sách sinh viên và trạng thái tải dữ liệu
  const [absentStudents, setAbsentStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. STATE: Form thêm sinh viên mới
  const [newMssv, setNewMssv] = useState('');
  const [newName, setNewName] = useState('');

  // 3. EFFECT: Tự động lấy danh sách sinh viên khi vừa mở trang
  useEffect(() => {
    fetchStudents();
  }, []);

  // Hàm GET: Gọi API lấy danh sách sinh viên từ Backend
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/students/');
      if (!response.ok) {
        throw new Error('Không thể kết nối với máy chủ Backend');
      }
      const data = await response.json();
      setAbsentStudents(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu. Hãy đảm bảo FastAPI đang chạy (uvicorn app.main:app).');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Hàm POST: Gửi dữ liệu sinh viên mới xuống Database
  const handleAddStudent = async (e) => {
    e.preventDefault(); 
    
    if (!newMssv || !newName) {
      alert("Vui lòng nhập đủ MSSV và Họ Tên!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_code: newMssv.toUpperCase().trim(),
          name: newName.trim(),
          class_name: "Chưa phân lớp" // Trường này tùy chọn dựa theo schemas.py của bạn
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Bắt lỗi từ Backend (ví dụ: Trùng mã MSSV)
        throw new Error(data.detail || "Có lỗi xảy ra khi thêm sinh viên");
      }

      // Thêm thành công: Cập nhật lại bảng và xóa trắng form
      setAbsentStudents([...absentStudents, data]);
      setNewMssv('');
      setNewName('');
      alert(`Đã thêm thành công: ${data.student_code}`);

    } catch (err) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#d12027', margin: 0 }}>📊 Dashboard Quản Lý Lớp Học</h1>
        <p style={{ color: '#666', marginTop: '5px' }}>Chỉ hiển thị sinh viên chưa điểm danh</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* CỘT TRÁI: FORM THÊM SINH VIÊN MỚI */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, fontSize: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            ➕ Thêm Sinh Viên Mới
          </h2>
          
          <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
              <label style={labelStyle}>Mã Sinh Viên (MSSV):</label>
              <input 
                type="text" 
                placeholder="VD: B23DCCN313" 
                value={newMssv}
                onChange={(e) => setNewMssv(e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>Họ và Tên:</label>
              <input 
                type="text" 
                placeholder="VD: Trần Văn Hiếu" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" style={btnStyle('#28a745')}>
              💾 Lưu vào Database
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: BẢNG SINH VIÊN CHƯA ĐIỂM DANH */}
        <div style={{ flex: 2, backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
              ⚠️ Danh sách Vắng mặt 
              <span style={{ backgroundColor: '#dc3545', color: 'white', padding: '3px 10px', borderRadius: '15px', fontSize: '14px', marginLeft: '10px' }}>
                {absentStudents.length}
              </span>
            </h2>
          </div>
          
          {/* Xử lý các trạng thái hiển thị: Lỗi, Đang tải, hoặc Trống */}
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontSize: '16px' }}>
              ⏳ Đang tải dữ liệu từ máy chủ...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#721c24', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
              ❌ {error}
            </div>
          ) : absentStudents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#28a745', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#d4edda', borderRadius: '8px' }}>
              🎉 Tuyệt vời! Tất cả sinh viên đã có mặt (hoặc lớp chưa có ai).
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>STT</th>
                  <th style={thStyle}>Mã Sinh Viên</th>
                  <th style={thStyle}>Họ và Tên</th>
                  <th style={thStyle}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {absentStudents.map((stu, index) => (
                  <tr key={stu.id || index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#d12027' }}>{stu.student_code}</td>
                    <td style={tdStyle}>{stu.name}</td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px 10px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}>
                        Chưa điểm danh
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};



// --- STYLING ---
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' };
const thStyle = { padding: '15px', color: '#495057' };
const tdStyle = { padding: '15px', color: '#212529' };
const btnStyle = (bgColor) => ({
  backgroundColor: bgColor, color: 'white', border: 'none', padding: '12px',
  borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%', marginTop: '10px'
});

export default Dashboard;
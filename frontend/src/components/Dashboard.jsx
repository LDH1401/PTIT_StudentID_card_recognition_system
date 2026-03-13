import React, { useState, useEffect } from 'react';
import './Dashboard.css'; 

const Dashboard = () => {
  // 1. STATE
  const [absentStudents, setAbsentStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMssv, setNewMssv] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  // 3. API GET: Lấy danh sách vắng
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/students/absent');
      if (!response.ok) {
        throw new Error('Không thể kết nối với máy chủ');
      }
      const data = await response.json();
      setAbsentStudents(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu...');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. API POST: Thêm sinh viên
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
          name: newName.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Có lỗi xảy ra khi thêm sinh viên");
      }

      setAbsentStudents([...absentStudents, data]);
      setNewMssv('');
      setNewName('');
      alert(`Đã thêm thành công: ${data.student_code}`);

    } catch (err) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  // 5. API POST: Điểm danh thủ công
  const handleManualCheckin = async (studentCode) => {
    if (!window.confirm(`Xác nhận điểm danh có mặt cho sinh viên: ${studentCode}?`)) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_code: studentCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Có lỗi xảy ra khi điểm danh");

      // Xóa mượt mà khỏi giao diện
      setAbsentStudents(absentStudents.filter(stu => stu.student_code !== studentCode));

    } catch (err) {
      console.error(err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  // 6. API DELETE: Reset dữ liệu
  const handleResetAttendance = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn reset?")) return;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/attendance/reset', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Lỗi khi làm mới dữ liệu");
      
      alert("Đã làm mới danh sách thành công!");
      fetchStudents(); 
    } catch (err) {
      console.error(err);
      alert("Lỗi: Không thể làm mới dữ liệu.");
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Quản Lý Lớp Học</h1>
      </div>

      <div className="dashboard-content">
        
        {/* CỘT TRÁI: FORM THÊM SINH VIÊN MỚI */}
        <div className="dashboard-card card-left">
          <h2 className="card-title bordered">➕ Thêm Sinh Viên Mới</h2>
          <form onSubmit={handleAddStudent} className="student-form">
            <div>
              <label className="form-label">Mã Sinh Viên (MSSV):</label>
              <input 
                type="text" 
                placeholder="VD: B23DCCN313" 
                value={newMssv}
                onChange={(e) => setNewMssv(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Họ và Tên:</label>
              <input 
                type="text" 
                placeholder="VD: Lê Duy Hùng" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-submit">Lưu</button>
          </form>
        </div>

        {/* CỘT PHẢI: BẢNG SINH VIÊN & NÚT RESET */}
        <div className="dashboard-card card-right">
          
          <div className="card-title-wrapper">
            <h2 className="card-title">
              ⚠️ Danh sách Vắng mặt 
              <span className="badge-count">{absentStudents.length}</span>
            </h2>
          </div>
          
          {/* TRẠNG THÁI HIỂN THỊ */}
          {isLoading ? (
            <div className="status-box status-loading">⏳ Đang tải dữ liệu từ máy chủ...</div>
          ) : error ? (
            <div className="status-box status-error">❌ {error}</div>
          ) : absentStudents.length === 0 ? (
            <div className="status-box status-success">🎉 Tuyệt vời! Tất cả sinh viên đã có mặt (hoặc lớp chưa có ai).</div>
          ) : (
            <table className="student-table">
              <thead>
                <tr className="table-head-row">
                  <th>STT</th>
                  <th>Mã Sinh Viên</th>
                  <th>Họ và Tên</th>
                  <th>Trạng thái</th>
                  <th>Điểm danh</th>
                </tr>
              </thead>
              <tbody>
                {absentStudents.map((stu, index) => (
                  <tr key={stu.id || index} className="table-body-row">
                    <td>{index + 1}</td>
                    <td className="td-student-code">{stu.student_code}</td>
                    <td>{stu.name}</td>
                    <td>
                      <span className="badge-absent">Chưa điểm danh</span>
                    </td>
                    {/* NÚT ACTION ĐÃ ĐƯỢC CHO VÀO THẺ <td> */}
                    <td>
                      <button 
                        className="btn-action btn-present"
                        onClick={() => handleManualCheckin(stu.student_code)}
                      >
                        ✔️ Có mặt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* NÚT RESET ĐƯỢC DỜI XUỐNG ĐÁY CARD */}
          <div className="card-footer">
            <button className="btn-reset" onClick={handleResetAttendance}>
              🔄 Reset Buổi Học
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
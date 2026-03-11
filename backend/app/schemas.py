from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# ==========================================
# SCHEMAS CHO STUDENT (SINH VIÊN)
# ==========================================

class StudentBase(BaseModel):
    student_code: str
    name: Optional[str] = None
    class_name: Optional[str] = None

class StudentCreate(StudentBase):
    """Schema dùng khi nhận request tạo mới Sinh viên"""
    pass

class StudentResponse(StudentBase):
    """Schema dùng khi trả dữ liệu Sinh viên về cho Client (có thêm ID)"""
    id: int

    # Bắt buộc có dòng này để Pydantic dịch được dữ liệu từ SQLAlchemy Object
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS CHO ATTENDANCE (ĐIỂM DANH)
# ==========================================

class AttendanceBase(BaseModel):
    student_id: str
    image_path: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    """Schema dùng khi tạo 1 lượt điểm danh mới"""
    pass

class AttendanceResponse(AttendanceBase):
    """Schema trả về thông tin điểm danh, kèm thời gian và ID"""
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS NÂNG CAO (KẾT HỢP RELATIONSHIP)
# ==========================================

class StudentWithAttendances(StudentResponse):
    """Trả về thông tin Sinh viên KÈM THEO lịch sử điểm danh của họ"""
    attendances: List[AttendanceResponse] = []

class AttendanceWithStudent(AttendanceResponse):
    """Trả về thông tin Điểm danh KÈM THEO thông tin Sinh viên đó"""
    student: StudentResponse
from sqlalchemy.orm import Session
from app.models import student as student_model
from app.models import attendance as attendance_model
from app import schemas


def get_student_by_code(db: Session, student_code: str):
    """Tìm sinh viên theo Mã SV"""
    return db.query(student_model.Student).filter(student_model.Student.student_code == student_code).first()

def create_student(db: Session, student: schemas.StudentCreate):
    """Thêm sinh viên mới vào CSDL"""
    db_student = student_model.Student(
        student_code=student.student_code, 
        name=student.name
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_all_students(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách toàn bộ sinh viên"""
    return db.query(student_model.Student).offset(skip).limit(limit).all()




def record_attendance(db: Session, student_code: str):
    """Ghi nhận 1 lượt điểm danh mới"""
    db_attendance = attendance_model.Attendance(
        student_code=student_code
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_absent_students(db: Session):
    # 1. Lấy danh sách các mã sinh viên CÓ mặt trong bảng Attendance
    attended_subquery = db.query(attendance_model.Attendance.student_code).subquery()
    
    # 2. Lọc ra những sinh viên trong bảng Students KHÔNG nằm trong danh sách trên
    absent_students = db.query(student_model.Student).filter(
        student_model.Student.student_code.not_in(attended_subquery)
    ).all()
    
    return absent_students

def reset_attendance(db: Session):
    db.query(attendance_model.Attendance).delete()
    db.commit()
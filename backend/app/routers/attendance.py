from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

# Mình thấy bạn đã tạo sẵn file ocr_service.py
# Giả định bên trong đó bạn viết hàm extract_mssv_from_image(image_bytes)
from app.services import ocr_service 

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/checkin")
async def checkin(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # 1. Đọc file ảnh người dùng gửi lên
        image_bytes = await file.read()
        
        # 2. Gọi service AI để trích xuất Mã sinh viên
        # Tùy thuộc vào cách bạn viết trong ocr_service.py, hãy gọi hàm tương ứng
        student_code = await ocr_service.extract_mssv_from_image(image_bytes)
        
        if not student_code:
            return {"success": False, "message": "Không nhận diện được thẻ sinh viên"}

        # 3. Kiểm tra xem sinh viên này có trong Database không
        student = crud.get_student_by_code(db, student_code=student_code)
        if not student:
            return {
                "success": False, 
                "student_code": student_code,
                "message": f"Mã SV {student_code} không thuộc lớp này!"
            }

        # 4. Ghi nhận điểm danh vào CSDL
        # (Nếu muốn, bạn có thể lưu file ảnh vào ổ cứng và truyền đường dẫn vào image_path)
        crud.record_attendance(db, student_code=student_code)

        # 5. Trả kết quả về cho React
        return {
            "success": True,
            "message": "Điểm danh thành công",
            "student_code": student.student_code,
            "name": student.name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
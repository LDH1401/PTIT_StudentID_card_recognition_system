from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import Routers và đặt bí danh thêm chữ "_router"
from app.routers import student as student_router
from app.routers import attendance as attendance_router

# 2. Import Models để SQLAlchemy nhận diện và tạo bảng
from app.models import student as student_model
from app.models import attendance as attendance_model
from app.database import engine, Base

# Tự động tạo bảng trong CSDL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hệ thống Điểm danh PTIT")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Gắn các Router bằng đúng tên bí danh vừa đặt
app.include_router(student_router.router)
app.include_router(attendance_router.router)
from pathlib import Path
from ultralytics import YOLO

class YOLOService:
    def __init__(self):
        
        model_path = "AI_service/weights/best.pt"

        print(f"🚀 Loading YOLO model từ: {model_path}")
        self.model = YOLO(str(model_path))

    def detect_student_card(self, image_path):
        results = self.model(image_path, conf=0.4) # Chỉ lấy các box có độ tin cậy > 50%
        for result in results:
            if len(result.boxes) > 0:
                # Ưu tiên tìm label tên là 'mssv'
                for box in result.boxes:
                    class_id = int(box.cls[0].item())
                    if result.names[class_id] == 'mssv':
                        return box.xyxy[0].cpu().numpy()
                # Nếu không thấy 'mssv', lấy box đầu tiên tìm được
                return result.boxes[0].xyxy[0].cpu().numpy()
        return None

yolo_service = YOLOService()
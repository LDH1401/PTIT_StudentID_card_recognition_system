import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import "./UploadImage.css";

const UploadImage = () => {
  const webcamRef = useRef(null);
  const [studentId, setStudentId] = useState(null);
  const [error, setError] = useState(null);

  // Dùng useRef để quản lý các "lá chắn" mà không làm trang bị giật lag (re-render)
  const isProcessingRef = useRef(false); // Trạng thái: Backend có đang bận đọc ảnh không?
  const cooldownRef = useRef(false);     // Trạng thái: Có đang trong thời gian nghỉ 3s không?

  const playSuccessSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
    oscillator.stop(audioCtx.currentTime + 0.2);
  };

  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Hàm cốt lõi: Tự động chụp và gửi đi
  const autoCaptureAndUpload = useCallback(async () => {
    // Nếu Backend đang bận, hoặc đang trong thời gian nghỉ, hoặc chưa bật camera -> Bỏ qua ngay
    if (isProcessingRef.current || cooldownRef.current || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // 1. Khóa luồng: Báo hiệu đang bắt đầu xử lý
    isProcessingRef.current = true;
    setError(null);

    const blob = dataURLtoBlob(imageSrc);
    const formData = new FormData();
    formData.append("file", blob, "webcam_capture.jpg");

    try {
      const response = await fetch("http://127.0.0.1:8000/attendance/checkin", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // THÀNH CÔNG: Kêu bíp, hiện mã SV
        setStudentId(data.student_code);
        playSuccessSound();

        // Kích hoạt lá chắn Cooldown (Nghỉ 3 giây)
        cooldownRef.current = true;
        setTimeout(() => {
          cooldownRef.current = false;
          setStudentId(null); // Trở lại trạng thái sẵn sàng đón người tiếp theo
        }, 3000);

      } else {
        // KHÔNG THẤY THẺ: Báo nhẹ nhàng, không cần cooldown
        setError("Đang quét... Vui lòng đưa thẻ vào khung hình");
        setStudentId(null);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối đến máy chủ AI");
    } finally {
      // 2. Mở khóa luồng: AI xử lý xong, sẵn sàng nhận ảnh mới
      isProcessingRef.current = false;
    }
  }, []);

  // VÒNG LẶP THỜI GIAN THỰC (Nhịp tim của hệ thống)
  useEffect(() => {
    console.log("🚀 Bắt đầu luồng quét thẻ tự động...");
    
    // Cứ mỗi 1.5 giây (1500ms) sẽ tự động gọi hàm chụp ảnh 1 lần
    const intervalId = setInterval(() => {
      autoCaptureAndUpload();
    }, 1500);

    // Dọn dẹp bộ nhớ khi tắt trang
    return () => clearInterval(intervalId);
  }, [autoCaptureAndUpload]);

  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        <h2 className="upload-title">Hệ Thống Quét Thẻ Tự Động</h2>

        {/* Khung Live Camera */}
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{ facingMode: "environment" }} 
          />
          {/* Khung ngắm đứt nét */}
          <div className="webcam-guideline"></div>
          
          {/* Hiệu ứng quét radar chạy lên xuống (Tùy chọn, bạn có thể thêm CSS sau) */}
          <div className="scan-line"></div>
        </div>

        {/* Khu vực hiển thị trạng thái Real-time */}
        <div style={{ marginTop: '20px' }}>
          {studentId ? (
            <div className="result-box result-success">
              ✅ Thành công! <br />
              <strong>{studentId}</strong>
            </div>
          ) : error === "Lỗi kết nối đến máy chủ" ? (
             <div className="result-box result-error">❌ {error}</div>
          ) : (
            <div className="result-box result-waiting">
              <span className="scanning-dots">🔴 Đang quét...</span>
              <br/>
              {error && <span style={{fontSize: '0.9em', opacity: 0.8}}>{error}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
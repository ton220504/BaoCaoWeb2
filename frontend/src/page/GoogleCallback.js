import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code"); // Lấy mã code từ URL

    if (code) {
      // Gọi API của backend để lấy thông tin người dùng
      axios
        .get(`http://localhost:8080/api/google/google-login?code=${code}`)
        .then((response) => {
          const data = response.data;

          if (data.accessToken) {
            // Lưu token vào localStorage
            localStorage.setItem("token", data.accessToken);

            // Lưu thông tin người dùng nếu cần
            localStorage.setItem("user", JSON.stringify(data));

            // Điều hướng về trang chủ
            navigate("/"); // Sau khi đăng nhập thành công, chuyển về trang chủ
          }
        })
        .catch((error) => {
          console.error("Lỗi khi đăng nhập Google:", error);
        });
    }
  }, [navigate]);

  return <div style={{display:"flex", justifyContent:"center", alignItems: "center",minHeight: "100vh", fontSize:"35px"}}>Đang xử lý đăng nhập...</div>;
};

export default GoogleCallback;

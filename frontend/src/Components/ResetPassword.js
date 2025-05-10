import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const email = localStorage.getItem("resetEmail");
    //console.log(email);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/auth/reset-password", null, {
                params: {
                    email: email,
                    otp: otp,
                    newPassword: newPassword
                }
            });
            alert("✅ Đặt lại mật khẩu thành công!");
            localStorage.removeItem("resetEmail");
            navigate("/login");
        } catch (error) {
            console.error("Lỗi đặt lại mật khẩu:", error);
            alert("Mã OTP không đúng hoặc đã hết hạn!");
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="container mt-5" style={{ maxWidth: "400px" }}>
            <h4>Đặt lại mật khẩu</h4>
            <Form.Group className="mb-3">
                <Form.Label>Mã OTP</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Nhập lại mật khẩu</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Xác nhận lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Button type="submit" variant="success" className="form-control">
                Đặt lại mật khẩu
            </Button>
        </Form>
    );
}

export default ResetPassword;

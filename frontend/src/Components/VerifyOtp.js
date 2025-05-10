import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const email = localStorage.getItem("resetEmail");
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/auth/verify-otp", {
                email,
                otp
            });
            navigate("/reset-password");
        } catch (error) {
            console.error("Lỗi xác thực OTP:", error);
            alert("Mã OTP không đúng hoặc đã hết hạn.");
        }
    };

    return (
        <Form onSubmit={handleVerify} className="container mt-5" style={{ maxWidth: "400px" }}>
            <h4>Nhập mã OTP</h4>
            <Form.Group className="mb-3">
                <Form.Label>Mã xác thực</Form.Label>
                <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
            </Form.Group>
            <Button type="submit" variant="success" className="form-control">
                Xác thực mã
            </Button>
        </Form>
    );
}

export default VerifyOtp;

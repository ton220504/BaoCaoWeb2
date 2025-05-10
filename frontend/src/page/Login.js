import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ComeBack from "../Components/ComeBack";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ip } from "../api/Api";

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const [editModalShow, setEditModalShow] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");


    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(""); // Xóa lỗi trước đó

        axios
            .post("http://localhost:8080/api/auth/signin", {
                email: email,
                password: password,
            })
            .then((result) => {
                console.log("Kết quả API:", result.data); // Debug API Response

                if (result.data.accessToken) {
                    localStorage.setItem("token", result.data.accessToken); // Lưu token chính xác
                    localStorage.setItem("user", JSON.stringify(result.data)); // Lưu token chính xác

                    Swal.fire({
                        icon: "success",
                        title: "Đăng nhập thành công!",
                        confirmButtonText: "OK",
                    }).then(() => {
                        navigate("/"); // Chuyển hướng trang
                        window.location.reload();
                    });
                    console.log(result.data.accessToken);
                } else {
                    setErrorMessage("Không tìm thấy token. Vui lòng thử lại!");
                }
            })
            .catch((err) => {
                setLoading(false);
                if (err.response) {
                    console.error("Lỗi API:", err.response.data); // Debug lỗi API
                    if (err.response.status === 400 || err.response.status === 422) {
                        setErrorMessage("Email hoặc mật khẩu không chính xác.");
                    } else {
                        setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
                    }
                } else {
                    setErrorMessage("Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.");
                }
            });
    }
    function handleChange(e) {
        if (e.target.name === "email") setEmail(e.target.value);
        if (e.target.name === "password") setPassword(e.target.value);

    }
    const closeEditModal = () => {
        setEditModalShow(false);

    };
    const openEditModal = () => {
        setEditModalShow(true);
    };
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!forgotEmail) {
            Swal.fire("Lỗi", "Vui lòng nhập email!", "error");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8080/api/auth/forgot-password`, null, {
                params: { email: forgotEmail },
            });

            console.log("Gửi mã OTP thành công:", response.data);

            // Lưu email vào localStorage trước khi điều hướng
            localStorage.setItem("resetEmail", forgotEmail);

            // Điều hướng tới trang reset-password
            navigate("/reset-password");
            closeEditModal();
        } catch (err) {
            console.error("Lỗi gửi OTP:", err);
            Swal.fire("Lỗi", "Gửi OTP thất bại. Vui lòng thử lại sau!", "error");
        }
    };


    return (
        <>
            <ComeBack />
            <Form className="mt-5 Login" onSubmit={handleSubmit}>
                <div className="content-login">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            className="img-header"
                            src="https://bizweb.dktcdn.net/100/497/960/themes/923878/assets/logo.png?1719291840576"
                            style={{ width: "200px", marginBottom: "10px" }}
                            alt="Logo"
                        />
                    </div>

                    <h4 className="text-center">Đăng nhập</h4>
                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Email..." onChange={handleChange} />

                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control type="password" name="password" placeholder="Mật khẩu..." onChange={handleChange} />
                    </Form.Group>
                    <Link className="forgot text-primary" onClick={openEditModal}>Quên mật khẩu?</Link>
                    <Link to="/register" className="register text-primary">Đăng kí tại đây</Link>

                </div>
                <div className="button p-3">
                    <Button className="signin form-control" type="submit">
                        {loading ? (
                            <div className="align-middle">
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                <span>Đăng nhập...</span>
                            </div>
                        ) : (
                            <span>Đăng nhập</span>
                        )}
                    </Button>
                    {/* <a
                       href={`https://accounts.google.com/o/oauth2/auth?client_id=101250735039-m4f4sm4dfuoh5qchgrlp7kkrjcs1k28r.apps.googleusercontent.com&redirect_uri=http://localhost:3000/google-callback&response_type=code&scope=openid%20email%20profile&prompt=consent`}
                        className="btn btn-lg btn-danger form-control"
                    > */}
                    <a className="btn btn-lg btn-danger form-control mt-3" href="https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&access_type=offline&redirect_uri=http://localhost:3000/google-callback&response_type=code&client_id=101250735039-m4f4sm4dfuoh5qchgrlp7kkrjcs1k28r.apps.googleusercontent.com">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-google" viewBox="0 0 16 16">
                            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                        </svg>
                        <span className="ms-2 fs-6">Đăng nhập bằng Google</span>
                    </a>

                </div>

            </Form>
            {/* Modal ra ngoài Form chính */}
            <Modal show={editModalShow} onHide={closeEditModal}>
                <Modal.Body>
                    <div className="container">
                        <h2>Quên mật khẩu</h2>
                        <Form onSubmit={handleForgotPassword}>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                                className="mb-2"
                            />
                            <Button type="submit" className="btn-submit form-control mb-2">
                                Gửi mã xác thực
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="btn-back form-control"
                                onClick={closeEditModal}
                            >
                                Quay lại
                            </Button>
                        </Form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeEditModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>



    );
}
export default Login;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';
import ComeBack from "../../Components/ComeBack";
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import { toast } from "react-toastify";
import "../../scss/Cart.scss";
import "../../scss/WishList.scss";
import Swal from 'sweetalert2';
const WishList = () => {
    const [wishlist, setWishList] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState(null);
    const [favoriteProducts, setFavoriteProducts] = useState([]);

    const formatCurrency = (value) => {
        return numeral(value).format('0,0') + ' ₫';
    };

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) return;

            const response = await axios.get(`http://localhost:8080/api/wishlist/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const wishlistItems = response.data.wishlistItems || [];
            const updatedWishListItems = wishlistItems.map((item) => ({
                id: item.id,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    brand: item.product.brand,
                    category: item.product.category,
                    price: item.product.price,
                    stockQuantity: item.product.stockQuantity,
                    releaseDate: item.product.releaseDate,
                    productAvailable: item.product.productAvailable,
                    image: `data:${item.product.imageType};base64,${item.product.imageDate}`,
                },
            }));

            setWishList(updatedWishListItems);
            setFavoriteProducts(updatedWishListItems.map((item) => item.product.id));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error);
            toast.error("Lỗi khi tải danh sách yêu thích!");
        } finally {
            setLoadingCart(false);
        }
    };

    const handleRemove = async (wishlistItemId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
    
            await axios.delete(`http://localhost:8080/api/wishlist/remove?wishlistItemId=${wishlistItemId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setWishList(prev => prev.filter(item => item.id !== wishlistItemId));
            setFavoriteProducts(prev => prev.filter(id => id !== wishlistItemId));
            Swal.fire({
                                toast: true,
                                position: "top-end",
                                icon: 'success',
                                title: 'Đã bỏ yêu thích!',
                                confirmButtonText: 'OK',
                                timer: 2000,
                                timerProgressBar: true
                            });
        } catch (error) {
            console.error("Lỗi khi xóa khỏi yêu thích:", error);
            toast.error("Lỗi khi xóa sản phẩm khỏi yêu thích");
        }
    };
    


    const checkUserLogin = () => {
        const token = localStorage.getItem("token");
        if (token) {
            getUserData();
        } else {
            setUser(null);
            setLoadingUser(false);
        }
    };

    const getUserData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await axios.get("http://localhost:8080/api/auth/user-info", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data) {
                setUser(response.data);
                fetchWishlist();
                setLoadingUser(false);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            localStorage.removeItem("token");
            setUser(null);
            window.location.reload();
        }
    };

    useEffect(() => {
        checkUserLogin();
        getUserData();
    }, []);

    if (loadingUser || loadingCart) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <img style={{ width: "100px" }} src="./img/loading-gif-png-5.gif" alt="Loading..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container text-center" style={{ height: "300px" }}>
                <h2 style={{ paddingTop: "100px", fontWeight: "bold", color: "red" }}>
                    Bạn cần đăng nhập để xem sản phẩm yêu thích
                </h2>
                <p>Đăng nhập
                    <Link to="/login" className='ms-1'>tại đây</Link>
                </p>
            </div>
        );
    }

    return (
        <>
            <ComeBack />
            <div className="container mt-4">
                <h5 className="mb-4" style={{ color: "red", fontSize: "20px", fontWeight: "bold", fontStyle: "italic" }}>
                    Sản phẩm yêu thích của bạn
                </h5>

                {wishlist.length === 0 ? (
                    <div className="text-center">
                        <img src="https://bizweb.dktcdn.net/100/479/509/themes/897806/assets/no-cart.png?1677998172667" alt="No wishlist" />
                        <p>Không có sản phẩm yêu thích nào</p>
                    </div>
                ) : (
                    <div className="list-group">
                        {wishlist.map((item, index) => (
                            <div key={index} className="list-group-item d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "15px" }}
                                    />
                                    <div>
                                        <h6>{item.product.name}</h6>
                                        <p className="mb-1 text-muted">Giá: {formatCurrency(item.product.price)}</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <button
                                        className="btn"
                                        onClick={() => handleRemove(item.id)}>
                                        <i className={`fa${favoriteProducts.includes(item.product.id) ? 's' : 'r'} fa-heart text-danger fs-5`}></i>
                                    </button>
                                    <Link to={`/chi-tiet-san-pham/${item.product.id}`} className="btn btn-outline-primary ms-2">
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default WishList;

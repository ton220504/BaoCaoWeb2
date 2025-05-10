import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import ComeBack from "../../Components/ComeBack";
import { toast, ToastContainer } from 'react-toastify';
import numeral from 'numeral';
import { Link, useNavigate } from 'react-router-dom';
import "../../scss/Cart.scss";
import Swal from 'sweetalert2';

const Cart = () => {
    const [cartitems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();
    const formatCurrency = (value) => {
        return numeral(value).format('0,0') + ' ₫';
    };
    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user || !user.id) {
                console.log("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!");
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/cart/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const cartItems = response.data.cartItems;
            if (!cartItems || cartItems.length === 0) {
                setCartItems([]);
                return;
            }

            const updatedCartItems = cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
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
            
            setCartItems(updatedCartItems);
            fetchImagesAndUpdateCart(updatedCartItems);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
        } finally {
            setLoadingCart(false);
        }
    };
    const fetchImagesAndUpdateCart = async (cartItems) => {
        try {
            const updatedItems = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const response = await axios.get(
                            `http://localhost:8080/api/product/${item.product.id}/image`,
                            { responseType: "blob" }
                        );
                        const imageUrl = URL.createObjectURL(response.data);
                        return { ...item, product: { ...item.product, imageUrl } };
                    } catch (error) {
                        console.error("Lỗi tải ảnh sản phẩm ID:", item.product.id, error);
                        return { ...item, product: { ...item.product, imageUrl: "/images/default-placeholder.jpg" } };
                    }
                })
            );

            setCartItems(updatedItems);
        } catch (error) {
            console.error("Lỗi khi cập nhật ảnh cho giỏ hàng:", error);
        }
    };
    const checkUserLogin = () => {
        const token = localStorage.getItem("token");
        if (token) {
            getUserData(token);
        } else {
            setUser(null);
            setLoadingUser(false);
        }
    };
    const getUserData = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("Không có token, yêu cầu đăng nhập!");
            setUser(null);
            setLoadingUser(false);
            return;
        }

        try {
            const response = await axios.get("http://localhost:8080/api/auth/user-info", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data) {
                setUser(response.data);
                fetchCartItems(token);
                setLoadingUser(false);
            } else {
                console.error("Dữ liệu user không hợp lệ:", response.data);
                setUser(null);
                setLoadingUser(false);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin người dùng:", error);
            localStorage.removeItem("token");
            setUser(null);
            setLoadingUser(false);
            window.location.reload();
        }
    };
    useEffect(() => {
        getUserData();
    }, []);
    const thanhtien = (price, quantity) => price * quantity;
    const tinhTongTien = () => {
        return cartitems
            .filter(item => selectedProducts.includes(item.id))
            .reduce((total, item) => total + thanhtien(item.product.price, item.quantity), 0);
    };
    const handleCheckout = () => {
        if (!cartitems || cartitems.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống!");
            return;
        }

        const selectedItems = cartitems
            .filter(item => selectedProducts.includes(item.id))
            .map(item => ({
                cartItemId: item.id,
                id: item?.product?.id ?? 0,
                name: item?.product?.name ?? "Không có tên",
                imageUrl: item.product.image,
                price: item?.product?.price ? parseFloat(item.product.price) : 0,
                quantity: item?.quantity ?? 1,
                stock: item?.product.stockQuantity,
                fromCart: true
            }));

        if (selectedItems.length === 0) {
            Swal.fire({
                toast: true,
                icon: 'warning',
                position: "top-end",
                title: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!',
                confirmButtonText: 'OK'
            });
            return;
        }

        for (let item of selectedItems) {
            if (item.quantity > item.stock) {
                Swal.fire({
                    toast: true,
                    icon: 'warning',
                    position: "top-end",
                    title: `Sản phẩm ${item.name} không đủ số lượng trong kho!`,
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

        const totalAmount = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        navigate('/thanh-toan', { state: { selectedItems, totalAmount } });
    };
    const handleIncrement = async (cartItemId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );

        const updatedItem = cartitems.find(item => item.id === cartItemId);
        if (!updatedItem) return;

        const updatedQuantity = updatedItem.quantity + 1;

        try {
            await axios.put(`http://localhost:8080/api/cart/update-quantity?cartItemId=${cartItemId}&quantity=${updatedQuantity}`);
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };
    const handleDecrement = async (cartItemId) => {
        const currentProduct = cartitems.find(item => item.id === cartItemId);
        if (!currentProduct || currentProduct.quantity <= 1) return;

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
            )
        );

        try {
            await axios.put(`http://localhost:8080/api/cart/update-quantity?cartItemId=${cartItemId}&quantity=${currentProduct.quantity - 1}`);
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };
    const handleRemove = async (cartItemId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Không tìm thấy token! Người dùng cần đăng nhập.");
                return;
            }

            await axios.delete(`http://localhost:8080/api/cart/remove?cartItemId=${cartItemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
            
            // Cập nhật danh sách sản phẩm đã chọn
            setSelectedProducts(prev => prev.filter(id => id !== cartItemId));
            
            toast.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
        }
    };
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            const allProductIds = cartitems.map(item => item.id);
            setSelectedProducts(allProductIds);
        } else {
            setSelectedProducts([]);
        }
    };
    const handleSelectProduct = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(itemId => itemId !== id));
            setSelectAll(false);
        } else {
            setSelectedProducts([...selectedProducts, id]);
            if (selectedProducts.length + 1 === cartitems.length) {
                setSelectAll(true);
            }
        }
    };
    if (loadingUser) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="cart-container">
                <div className="login-required">
                    <div className="icon">
                        <i className="fas fa-lock"></i>
                    </div>
                    <h2>Bạn cần đăng nhập để xem giỏ hàng</h2>
                    <p>Vui lòng <Link to="/login">Đăng nhập</Link> để tiếp tục mua sắm</p>
                </div>
            </div>
        );
    }
    if (loadingCart) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <ComeBack />
            <ToastContainer />
            <div className="cart-container fadeIn">
                <div className="cart-header">
                    <h2 className="title-cart">Giỏ hàng của bạn</h2>
                    <div className="cart-actions">
                        <Link to="/san-pham" className="btn-continue-shopping">
                            <i className="fas fa-arrow-left"></i> Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
                {cartitems.length === 0 ? (
                    <div className="empty-cart">
                        <img src="https://bizweb.dktcdn.net/100/479/509/themes/897806/assets/no-cart.png?1677998172667" alt="Giỏ hàng trống" />
                        <span>Không có sản phẩm nào trong giỏ hàng</span>
                        <Link to="/tat-ca-san-pham">
                            <button className="btn-shop-now">Mua sắm ngay</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>
                                        <label className="custom-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}/>
                                            <span className="checkmark"></span>
                                        </label>
                                    </th>
                                    <th>Tên sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartitems.map((item, index) => (
                                    <tr key={index} className="fadeIn" style={{animationDelay: `${index * 0.05}s`}}>
                                        <td data-label="Chọn">
                                            <label className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(item.id)}
                                                    onChange={() => handleSelectProduct(item.id)}/>
                                                <span className="checkmark"></span>
                                            </label>
                                        </td>
                                        <td data-label="Sản phẩm">
                                            <div className="product-detail">
                                                <div className="product-img">
                                                    <Link to={`/chi-tiet-san-pham/${item.product.id}`}>
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            width="80"
                                                            height="80"/>
                                                    </Link>
                                                </div>
                                                <div>
                                                    <div className="product-name">{item.product.name}</div>
                                                   
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Đơn giá" className="price">
                                            {formatCurrency(item.product.price)}
                                        </td>
                                        <td data-label="Số lượng">
                                            <div className="quantity-controls">
                                                <button 
                                                    className="btn-quantity"
                                                    onClick={() => handleDecrement(item.id)}
                                                    disabled={item.quantity <= 1}>
                                                    -
                                                </button>
                                                <input 
                                                    type="text" 
                                                    className="quantity-input" 
                                                    value={item.quantity} 
                                                    readOnly />
                                                <button 
                                                    className="btn-quantity"
                                                    onClick={() => handleIncrement(item.id)}>
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td data-label="Thành tiền" className="subtotal">
                                            {formatCurrency(thanhtien(item.product.price, item.quantity))}
                                        </td>
                                        <td data-label="Thao tác" className="actions">
                                            <button 
                                                className="btn-remove"
                                                onClick={() => handleRemove(item.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="cart-footer">
                            <div className="cart-total">
                                <div className="total-label">Tổng thanh toán ({selectedProducts.length} sản phẩm):</div>
                                <p className="total-amount">{formatCurrency(tinhTongTien())}</p>
                            </div>
                            <button className="btn-checkout" onClick={handleCheckout}>
                                <i className=""></i> Thanh toán ngay
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Cart;
package com.tranvantoan.example205.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tranvantoan.example205.entity.Address;
import com.tranvantoan.example205.entity.Order;
import com.tranvantoan.example205.entity.OrderItem;
import com.tranvantoan.example205.entity.Product;
import com.tranvantoan.example205.entity.User;
import com.tranvantoan.example205.model.enums.OrderStatus;
import com.tranvantoan.example205.payload.request.OrderRequest;
import com.tranvantoan.example205.repository.AddressRepository;
import com.tranvantoan.example205.repository.OrderItemRepository;
import com.tranvantoan.example205.repository.OrderRepository;
import com.tranvantoan.example205.repository.ProductRepository;
import com.tranvantoan.example205.repository.UserRepository;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    // 📌 Lấy tất cả đơn hàng
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 📌 Lấy đơn hàng theo ID
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
    
    // 📌 Lấy danh sách đơn hàng theo User ID
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // 📌 Tạo đơn hàng mới
    public Order createOrder(OrderRequest orderRequest) {
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = new Address();
        address.setProvince(orderRequest.getAddress().getProvince());
        address.setDistrict(orderRequest.getAddress().getDistrict());
        address.setWard(orderRequest.getAddress().getWard());
        address.setStreet(orderRequest.getAddress().getStreet());
        addressRepository.save(address);

        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(orderRequest.getStatus());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setShippingAddress(address);
        orderRepository.save(order);

        List<OrderItem> orderItems = orderRequest.getOrderItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId()) // Không cần ép kiểu
                    .orElseThrow(() -> new RuntimeException("Product not found"));
        
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(itemRequest.getPrice());
            return orderItem;
        }).collect(Collectors.toList());
        

        orderItemRepository.saveAll(orderItems);
        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }

    // 📌 Cập nhật trạng thái đơn hàng
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    // 📌 Xóa đơn hàng
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }

    // 📌 Thêm OrderItem vào Order
    public OrderItem addOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    // 📌 Lấy danh sách sản phẩm trong đơn hàng
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    // 📌 Xóa OrderItem khỏi đơn hàng
    public void removeOrderItem(Long orderItemId) {
        orderItemRepository.deleteById(orderItemId);
    }
}
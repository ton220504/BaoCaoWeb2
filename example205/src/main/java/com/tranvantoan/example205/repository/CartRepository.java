package com.tranvantoan.example205.repository;

import com.tranvantoan.example205.entity.Cart;
import com.tranvantoan.example205.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByUser(User user); // Tìm giỏ hàng dựa vào đối tượng User


    
}

package com.tranvantoan.example205.controller;

import com.tranvantoan.*;
import com.tranvantoan.example205.GoogleUtils;
import com.tranvantoan.example205.entity.GoogleAccount;

import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@Controller
public class GoogleLoginController {

    @GetMapping("/google-login")
    public String googleLogin(@RequestParam("code") String code, HttpSession session) {
        try {
            String accessToken = GoogleUtils.getToken(code);
            GoogleAccount googleUser = GoogleUtils.getUserInfo(accessToken);

            // Lưu user vào session
            session.setAttribute("user", googleUser);

            // Chuyển hướng đến trang chính
            return "redirect:/home";
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/login?error";
        }
    }
}

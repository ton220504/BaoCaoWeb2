package com.tranvantoan.example205.payload.request;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String otp;
}

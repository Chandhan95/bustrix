package com.busbooking.controller;

import com.busbooking.dto.request.LoginRequest;
import com.busbooking.dto.request.RegisterRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.AuthResponse;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
//Controller for handling authentication-related endpoints such as registration, login, email verification, and password reset. It uses AuthService to perform the actual business logic and returns standardized API responses.
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.info("Register request for: {}", request.getEmail());
        UserResponse user = authService.register(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Registration successful. Welcome to BusTix!", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.info("Login request for: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody Map<String, String> body) {
        authService.verifyEmail(body.get("email"), body.get("otp"));
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(ApiResponse.success(
                "Password reset link sent to your email", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }
}

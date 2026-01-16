package com.paypal.user_service.dto;

public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String adminKey;

    public SignupRequest() {}

    public SignupRequest(String name, String email, String password, String adminKey) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.adminKey = adminKey;
    }

    public String getAdminKey() {
        return adminKey;
    }

    public void setAdminKey(String adminKey) {
        this.adminKey = adminKey;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

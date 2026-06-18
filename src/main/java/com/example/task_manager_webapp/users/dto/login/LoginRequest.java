package com.example.task_manager_webapp.users.dto.login;

public class LoginRequest {
    private String account;
    private String password;

    // Getter e Setter
    public String getAccount() {
        return account;
    }

    public void setAccount(String Account) {
        this.account = Account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
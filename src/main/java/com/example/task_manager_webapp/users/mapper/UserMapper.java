package com.example.task_manager_webapp.users.mapper;

import com.example.task_manager_webapp.security.Security;
import com.example.task_manager_webapp.users.User;
import com.example.task_manager_webapp.users.dto.register.RegistrationRequest;
import org.springframework.security.crypto.bcrypt.BCrypt;

public class UserMapper {
    public static User fromRequest(RegistrationRequest request) {
        try {
            User user = new User(
                    request.getEmail(),
                    request.getUsername(),
                    BCrypt.hashpw(request.getPassword(), BCrypt.gensalt())
            );

            return user;
        } catch (Exception e) {
            return null;
        }
    }
}
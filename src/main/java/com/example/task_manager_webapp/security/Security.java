package com.example.task_manager_webapp.security;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.MessageDigest;

@Configuration
public class Security {
    public static String toSafeHtml(String unsafeContent) {
        if (unsafeContent == null) {
            return null;
        }
        return StringEscapeUtils.escapeHtml4(unsafeContent);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    public static boolean isValidUsername(String value) {
        if (value == null)
            return false;

        return value.matches("^[a-zA-Z0-9_]{3,32}$");
    }

    public static boolean isValidEmail(String value) {
        if (value == null)
            return false;

        return value.matches("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$")
                && value.length() <= 254;
    }

    public static boolean isValidPassword(String value) {
        if (value == null)
            return false;

        return value.length() <= 128 &&
                !value.contains("<") &&
                !value.contains(">");
    }

    public static String sanitizeText(String value) {
        if (value == null)
            return null;

        return StringEscapeUtils.escapeHtml4(value)
                .replaceAll("\\s{2,}", " ")
                .trim();
    }
}

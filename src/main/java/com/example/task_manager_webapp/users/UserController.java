package com.example.task_manager_webapp.users;

import com.example.task_manager_webapp.security.tokens.TokenService;
import com.example.task_manager_webapp.users.dto.PasswordRequest;
import com.example.task_manager_webapp.users.dto.login.LoginRequest;
import com.example.task_manager_webapp.users.dto.login.LoginResponse;
import com.example.task_manager_webapp.users.dto.register.RegistrationRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(("/api/v1/user"))
public class UserController {
    private final UserService userService;
    private final TokenService tokenService;

    public UserController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }

    @PostMapping() // TO BAN SPECIAL CHARS.
    public ResponseEntity<String> registerNewUser(@RequestBody RegistrationRequest user) {
        boolean registered = userService.registerNewUser(user);
        if (registered) {
            return ResponseEntity.status(HttpStatus.CREATED).body("OK. user successfully registered.");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ERR. user already exists.");
    }

    @PostMapping("/in")
    public ResponseEntity<?> loginUser(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response
    ) {
        Optional<Map<String, Object>> dataOptional = userService.login(loginRequest.getAccount(), loginRequest.getPassword());
        if (dataOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ERR. invalid account or password");
        }

        Map<String, Object> data = dataOptional.get();

        String token = (String) data.get("token");
        ResponseCookie cookie = ResponseCookie.from("authentication-token", token)
                .httpOnly(true)
                .secure(false) // HTTPS = true (localhost = false)
                .sameSite("Lax")
                .maxAge(30 * 24 * 60 * 60) // 24H * 30
                .path("/")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok((LoginResponse) data.get("user"));
    }

    @PostMapping("/out")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = getTokenFromCookie(request);
        System.out.print(token);
        if (token != null) {
            userService.logout(response, token);
        }
        return ResponseEntity.ok().build();
    }

    // TESTING ENDPOINT
    /*
    @PostMapping("/me/extend-session")
    public  ResponseEntity<?> extendUserSession(
            @CookieValue(name = "authentication-token") String token,
            HttpServletResponse response
    ) {
        boolean isExtendedSession = tokenService.extendSession(token, response, 30);
        if (isExtendedSession) {
            return ResponseEntity.ok("OK. session extended.");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ERR. not valid cookie.");
    }
    */

    @DeleteMapping(path = "/me")
    public ResponseEntity<String> deleteUser(
            @CookieValue(name = "authentication-token") String token
    ) {
        boolean deleted = userService.deleteUser(token);
        if (deleted) {
            return ResponseEntity.ok("OK. user successfully deleted.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERR. user not found.");
    }

    @PutMapping(path = "/me") // TO BAN SPECIAL CHARS.
    public ResponseEntity<String> updateUser(
            @CookieValue(name = "authentication-token") String token,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email
    ) {
        boolean updated = userService.updateUser(token, username, email);
        if (updated) {
            return ResponseEntity.ok("OK. user information successfully updated.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERR. user not found.");
    }

    @PostMapping(path = "me/verify-password")
    public ResponseEntity<String> verifyOldPassword(
            @CookieValue(name = "authentication-token") String token,
            @RequestBody PasswordRequest passwordRequest
    ) {
        User user = userService.checkPassword(token, passwordRequest.getPassword());
        if (user != null) {
            return ResponseEntity.ok("OK. password verified.");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ERR. incorrect password.");
    }

    @PutMapping(path = "me/password") // TO BAN SPECIAL CHARS.
    public ResponseEntity<String> updateUserPassword(
            @CookieValue(name = "authentication-token") String token,
            @RequestBody PasswordRequest passwordRequest
    ) {

        boolean updated = userService.updateUserPassword(token, passwordRequest.getPassword(), passwordRequest.getReplacementPassword());
        if (updated) {
            return ResponseEntity.ok("OK. password successfully updated.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERR. invalid credentials.");
    }

    private String getTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("authentication-token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
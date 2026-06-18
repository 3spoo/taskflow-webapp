package com.example.task_manager_webapp.users;

import com.example.task_manager_webapp.tasks.Task;
import com.example.task_manager_webapp.tasks.TaskPriority;
import com.example.task_manager_webapp.tasks.TaskService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Configuration
public class UserConfiguration {
    private static final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    @Bean
    @Order(1)
    CommandLineRunner userCommandLineRunner (UserRepository userRepository, TaskService taskService){
        // The codebase is structured to support multiple users.
        return args -> {
            User admin = new User(
                    "admin@admin.com",
                    "admin",
                    encoder.encode("admin123")
            );

            for (User user : List.of(admin)){
                if (userRepository.findByUsernameOrEmail(user.getUsername(), user.getEmail()).isEmpty()){
                    userRepository.save(user);

                    Task DEFAULT_TASK = new Task(
                            "New task",
                            "Task description. This is an example of a simple task.",
                            LocalDate.now(),
                            TaskPriority.DEFAULT,
                            user
                    );

                    taskService.createDefaultTask(user);
                }
            }
        };
    }
}
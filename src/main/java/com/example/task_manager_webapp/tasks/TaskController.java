package com.example.task_manager_webapp.tasks;

import com.example.task_manager_webapp.security.Security;
import com.example.task_manager_webapp.tasks.dto.TaskRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(("/api/v1/task"))
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getUserTasks(
            @CookieValue(name = "authentication-token") String token
    ) {
        Optional<List<Task>> userTaskOptional = taskService.
                getUserTasks(token);

        if (userTaskOptional.isPresent()) {
            List<Task> tasks = userTaskOptional.get();
            for (Task task : tasks) {
                task.setTitle(
                        Security.toSafeHtml(task.getTitle())
                );
                task.setDescription(
                        Security.toSafeHtml(task.getDescription())
                );
            }
            return ResponseEntity.ok(tasks);
        }
        else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<String> addNewTask(
            @CookieValue(name = "authentication-token") String token,
            @RequestBody TaskRequestDTO taskDTO
    ) {
        boolean added = taskService.addNewTask(token, taskDTO);
        if (added) {
            return ResponseEntity.status(HttpStatus.CREATED).body("OK. task successfully added.");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ERR. user not found or error while saving task.");
    }

    @DeleteMapping(path = "{taskId}")
    public ResponseEntity<String> deleteTask(
            @CookieValue(name = "authentication-token") String token,
            @PathVariable Long taskId
    ) {
        boolean deleted = taskService.deleteTask(token, taskId);
        if (deleted) {
            return ResponseEntity.ok("OK. Task successfully deleted.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERR. task not found.");
    }

    @GetMapping(path = "{taskId}")
    public ResponseEntity<Task> getTaskById(
            @CookieValue(name = "authentication-token") String token,
            @PathVariable Long taskId
    ) {
        Optional<Task> task = taskService.getTaskByIdIfValidToken(token, taskId);
        if (task.isPresent()) {
            return ResponseEntity.ok(task.get());
        }

        return ResponseEntity.notFound().build();
    }

    @PutMapping(path = "{taskId}")
    public ResponseEntity<String> updateTask(
            @CookieValue(name = "authentication-token") String token,
            @PathVariable Long taskId,
            @RequestBody TaskRequestDTO taskDTO
    ) {
        boolean updated = taskService.updateTask(
                token,
                taskId,
                taskDTO.getTitle(),
                taskDTO.getDescription(),
                taskDTO.getDueDate(),
                taskDTO.getPriority()
        );
        if (updated) {
            return ResponseEntity.ok("OK. task information successfully updated.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERR. task not found.");
    }

    @PutMapping(path = "{taskId}/check")
    public ResponseEntity<String> checkTask(
            @CookieValue(name = "authentication-token") String token,
            @PathVariable Long taskId
    ) {
        Optional<Boolean> checked = taskService
                .checkTask(
                        token,
                        taskId
                );

        if (checked.isPresent()) {
            return ResponseEntity
                    .ok(
                            checked.get() ? "OK. task marked as completed." : "OK. task marked as not completed."
                    );
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("ERR. failed to update task status. task may not exist.");
    }
}
package com.example.task_manager_webapp.tasks;

import com.example.task_manager_webapp.users.User;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String title;
    private String description;
    private LocalDate creationDate;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority;

    private boolean completed;

    public Task() {

    }

    public Task(String title, String description, LocalDate dueDate, TaskPriority priority, User user) {
        this.title = title;
        this.description = description;
        this.creationDate = LocalDate.now();
        this.dueDate = dueDate;
        this.priority = priority;
        this.user = user;
        this.completed = false;
    }

    @JsonProperty("user_id")
    public Long getUser_id() {
        return user != null ? user.getId() : null;
    }

    public long getId() {
        return id;
    }

    public void checkExpiration(){
        if (
                LocalDate.now().isAfter(dueDate) &&
                !priority.equals(TaskPriority.DEFAULT))
        {
            priority = TaskPriority.EXPIRED;
        }
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

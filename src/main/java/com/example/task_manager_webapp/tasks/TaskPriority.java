package com.example.task_manager_webapp.tasks;

public enum TaskPriority {
    DEFAULT(0),
    LOW(1),
    MEDIUM(2),
    HIGH(3),
    EXPIRED(-1);

    private final int value;

    TaskPriority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
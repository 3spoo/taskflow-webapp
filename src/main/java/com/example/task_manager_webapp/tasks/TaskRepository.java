package com.example.task_manager_webapp.tasks;

import com.example.task_manager_webapp.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query(
        "SELECT t FROM Task t WHERE t.user = :user " +
        "ORDER BY " +
            "CASE WHEN t.completed = true THEN 1 " + // is_completed
                "ELSE 0 " +
            "END, " +
            "CASE t.priority " + // priority_sort
                "WHEN com.example.task_manager_webapp.tasks.TaskPriority.DEFAULT THEN 1 " +
                "WHEN com.example.task_manager_webapp.tasks.TaskPriority.HIGH THEN 2 " +
                "WHEN com.example.task_manager_webapp.tasks.TaskPriority.MEDIUM THEN 3 " +
                "WHEN com.example.task_manager_webapp.tasks.TaskPriority.LOW THEN 4 " +
                "WHEN com.example.task_manager_webapp.tasks.TaskPriority.EXPIRED THEN 5 " +
            "END, " +
            "t.dueDate ASC, " + // date_sort
            "t.creationDate ASC "
    )
    List<Task> findAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM Task t WHERE t.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
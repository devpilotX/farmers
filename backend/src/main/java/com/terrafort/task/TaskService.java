package com.terrafort.task;

import com.terrafort.config.ApiException;
import com.terrafort.farm.FarmService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
  private final TaskRepository tasks;
  private final FarmService farms;

  public TaskService(TaskRepository tasks, FarmService farms) {
    this.tasks = tasks;
    this.farms = farms;
  }

  public List<TaskRecord> list(UUID farm, UUID organisation) {
    farms.find(farm, organisation);
    return tasks.list(farm, organisation);
  }

  @Transactional
  public TaskRecord update(UUID farm, UUID task, UUID organisation, boolean completed) {
    list(farm, organisation).stream()
        .filter(item -> item.id().equals(task))
        .findFirst()
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "TASK_NOT_FOUND",
                    "This action was not found for the selected farm."));
    if (tasks.setCompleted(farm, task, organisation, completed))
      tasks.audit(farm, organisation, "TASK_UPDATED");
    return tasks.list(farm, organisation).stream()
        .filter(item -> item.id().equals(task))
        .findFirst()
        .orElseThrow();
  }
}

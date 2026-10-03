package com.terrafort.farm;

import com.terrafort.config.OrganisationContext;
import com.terrafort.task.TaskRecord;
import com.terrafort.task.TaskService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class FarmController {
  private final FarmService farms;
  private final TaskService tasks;
  private final OrganisationContext organisation;

  public FarmController(FarmService farms, TaskService tasks, OrganisationContext organisation) {
    this.farms = farms;
    this.tasks = tasks;
    this.organisation = organisation;
  }

  @GetMapping("/workspace")
  public Map<String, Object> workspace() {
    organisation.current();
    boolean demo = organisation.isLocal();
    return Map.of(
        "mode",
        demo ? "local-demo" : "authenticated",
        "playbookStatus",
        "illustrative-not-approved");
  }

  @GetMapping("/farms")
  public List<FarmRecord> list() {
    return farms.list(organisation.current());
  }

  @PostMapping("/farms")
  public ResponseEntity<FarmRecord> create(@Valid @RequestBody FarmInput input) {
    var farm = farms.create(input, organisation.current());
    return ResponseEntity.created(URI.create("/api/v1/farms/" + farm.id())).body(farm);
  }

  @GetMapping("/farms/{farm}")
  public FarmRecord find(@PathVariable UUID farm) {
    return farms.find(farm, organisation.current());
  }

  @GetMapping("/farms/{farm}/tasks")
  public List<TaskRecord> tasks(@PathVariable UUID farm) {
    return tasks.list(farm, organisation.current());
  }

  @PutMapping("/farms/{farm}/tasks/{task}")
  public TaskRecord update(
      @PathVariable UUID farm, @PathVariable UUID task, @Valid @RequestBody TaskInput input) {
    return tasks.update(farm, task, organisation.current(), input.completed());
  }

  public record TaskInput(@NotNull Boolean completed) {}
}

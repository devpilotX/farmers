package com.terrafort.task;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TaskRepository {
  private final JdbcTemplate jdbc;

  public TaskRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<TaskRecord> list(UUID farm, UUID organisation) {
    return jdbc.query(
        "SELECT * FROM action_task WHERE farm_id=? AND organisation_id=? ORDER BY position",
        (row, index) ->
            new TaskRecord(
                row.getObject("id", UUID.class),
                row.getObject("farm_id", UUID.class),
                row.getString("title"),
                row.getString("detail"),
                row.getBoolean("completed"),
                row.getTimestamp("updated_at").toInstant()),
        farm,
        organisation);
  }

  public void createPlan(UUID farm, UUID organisation) {
    add(
        farm,
        organisation,
        0,
        "Record movable equipment",
        "List pumps and tools, and discuss a safe storage location with your field agent.");
    add(
        farm,
        organisation,
        1,
        "Keep farm documents together",
        "Keep copies of farm and policy documents in a dry place. This does not confirm insurance cover.");
    add(
        farm,
        organisation,
        2,
        "Agree a household contact plan",
        "Record who to contact and follow official authorities during an emergency. Do not enter floodwater.");
  }

  private void add(UUID farm, UUID organisation, int position, String title, String detail) {
    jdbc.update(
        "INSERT INTO action_task (id,farm_id,organisation_id,position,title,detail) VALUES (?,?,?,?,?,?)",
        UUID.randomUUID(),
        farm,
        organisation,
        position,
        title,
        detail);
  }

  public boolean setCompleted(UUID farm, UUID task, UUID organisation, boolean completed) {
    // Desired-state writes are idempotent. Concurrent opposing writes use last committed write.
    return jdbc.update(
            "UPDATE action_task SET completed=?,updated_at=now() WHERE id=? AND farm_id=? AND organisation_id=? AND completed<>?",
            completed,
            task,
            farm,
            organisation,
            completed)
        == 1;
  }

  public void audit(UUID farm, UUID organisation, String event) {
    jdbc.update(
        "INSERT INTO audit_event (id,organisation_id,farm_id,event_type) VALUES (?,?,?,?)",
        UUID.randomUUID(),
        organisation,
        farm,
        event);
  }
}

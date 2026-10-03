package com.terrafort.farm;

import com.terrafort.config.ApiException;
import com.terrafort.task.TaskRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FarmService {
  private final FarmRepository farms;
  private final TaskRepository tasks;
  private final BoundaryValidator boundary;
  private final JdbcTemplate jdbc;

  public FarmService(
      FarmRepository farms, TaskRepository tasks, BoundaryValidator boundary, JdbcTemplate jdbc) {
    this.farms = farms;
    this.tasks = tasks;
    this.boundary = boundary;
    this.jdbc = jdbc;
  }

  public List<FarmRecord> list(UUID organisation) {
    return farms.list(organisation);
  }

  public FarmRecord find(UUID id, UUID organisation) {
    return farms
        .find(id, organisation)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "FARM_NOT_FOUND",
                    "This farm was not found in your workspace."));
  }

  @Transactional
  public FarmRecord create(FarmInput input, UUID organisation) {
    boundary.validate(input.boundary());
    String hash = hash(farms.encode(input));
    // Serialises only matching tenant/request keys. The unique constraint remains the final
    // backstop.
    jdbc.queryForObject(
        "SELECT pg_advisory_xact_lock(hashtextextended(?,0))",
        Object.class,
        organisation + ":" + input.requestId());
    var replay = farms.replay(input, organisation, hash);
    if (replay.isPresent()) return replay.get();
    UUID id = farms.insert(input, organisation, hash);
    tasks.createPlan(id, organisation);
    tasks.audit(id, organisation, "FARM_REGISTERED");
    return find(id, organisation);
  }

  private String hash(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (java.security.NoSuchAlgorithmException error) {
      throw new IllegalStateException("SHA-256 unavailable", error);
    }
  }
}

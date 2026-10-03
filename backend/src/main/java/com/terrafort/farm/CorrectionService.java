package com.terrafort.farm;

import com.terrafort.config.ApiException;
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
public class CorrectionService {
  private final FarmRepository farms;
  private final FarmService records;
  private final RecordHistory history;
  private final BoundaryValidator boundary;
  private final JdbcTemplate jdbc;

  public CorrectionService(
      FarmRepository farms,
      FarmService records,
      RecordHistory history,
      BoundaryValidator boundary,
      JdbcTemplate jdbc) {
    this.farms = farms;
    this.records = records;
    this.history = history;
    this.boundary = boundary;
    this.jdbc = jdbc;
  }

  @Transactional
  public FarmRecord correct(UUID id, UUID organisation, CorrectionInput input) {
    boundary.validate(input.boundary());
    String hash = hash(farms.encode(input));
    jdbc.queryForObject(
        "SELECT pg_advisory_xact_lock(hashtextextended(?,0))",
        Object.class,
        organisation + ":correction:" + input.requestId());
    var farm =
        farms
            .lock(id, organisation)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "FARM_NOT_FOUND",
                        "This farm was not found in your workspace."));
    if (history.replay(id, organisation, input.requestId(), hash)) return farm;
    if (farm.version() != input.expectedVersion()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VERSION_CONFLICT",
          "This record changed after you opened it. Review the current record before correcting it.");
    }
    var fields = input.changedFields(farm);
    if (fields.isEmpty())
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "NO_CHANGES",
          "No farm details changed. Review the fields before submitting a correction.");
    if (farm.version() == Integer.MAX_VALUE)
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VERSION_LIMIT",
          "This record needs administrator review before another correction.");
    farms.correct(id, organisation, input);
    history.record(id, organisation, input, hash, farms.encode(fields));
    return records.find(id, organisation);
  }

  public List<RecordEvent> history(UUID id, UUID organisation) {
    records.find(id, organisation);
    return history.list(id, organisation);
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

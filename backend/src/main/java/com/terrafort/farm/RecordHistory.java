package com.terrafort.farm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terrafort.config.ApiException;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RecordHistory {
  private final JdbcTemplate jdbc;
  private final ObjectMapper mapper;

  public RecordHistory(JdbcTemplate jdbc, ObjectMapper mapper) {
    this.jdbc = jdbc;
    this.mapper = mapper;
  }

  public boolean replay(UUID farm, UUID organisation, UUID request, String hash) {
    var events =
        jdbc.queryForList(
            "SELECT farm_id, request_hash FROM audit_event WHERE organisation_id=? AND request_id=?",
            organisation,
            request);
    if (events.isEmpty()) return false;
    var event = events.getFirst();
    if (!farm.equals(event.get("farm_id")) || !hash.equals(event.get("request_hash"))) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "REQUEST_CONFLICT",
          "This correction identifier already belongs to a different submission.");
    }
    return true;
  }

  public void record(
      UUID farm, UUID organisation, CorrectionInput input, String hash, String encodedFields) {
    jdbc.update(
        """
      INSERT INTO audit_event (id,organisation_id,farm_id,event_type,request_id,request_hash,
      expected_version,record_version,changed_fields,reason,recorded_at)
      VALUES (?,?,?,'FARM_CORRECTED',?,?,?, ?,?::jsonb,?,clock_timestamp())
      """,
        UUID.randomUUID(),
        organisation,
        farm,
        input.requestId(),
        hash,
        input.expectedVersion(),
        input.expectedVersion() + 1,
        encodedFields,
        input.reason().trim());
  }

  public List<RecordEvent> list(UUID farm, UUID organisation) {
    return jdbc.query(
        "SELECT id,event_type,recorded_at,record_version,changed_fields,reason FROM audit_event WHERE farm_id=? AND organisation_id=? ORDER BY recorded_at DESC,id LIMIT 100",
        this::event,
        farm,
        organisation);
  }

  private RecordEvent event(java.sql.ResultSet row, int index) throws SQLException {
    return new RecordEvent(
        row.getObject("id", UUID.class),
        row.getString("event_type"),
        row.getTimestamp("recorded_at").toInstant(),
        row.getObject("record_version", Integer.class),
        fields(row.getString("changed_fields")),
        row.getString("reason"));
  }

  private List<String> fields(String encoded) throws SQLException {
    if (encoded == null) return List.of();
    try {
      return mapper.readValue(encoded, new TypeReference<>() {});
    } catch (Exception error) {
      throw new SQLException("Cannot read recorded correction fields", error);
    }
  }
}

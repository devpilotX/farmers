package com.terrafort.farm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FarmRepository {
  private final JdbcTemplate jdbc;
  private final ObjectMapper mapper;

  public FarmRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
    this.jdbc = jdbc;
    this.mapper = mapper;
  }

  public List<FarmRecord> list(UUID organisation) {
    return jdbc.query(
        "SELECT * FROM farm WHERE organisation_id=? ORDER BY created_at DESC, id LIMIT 500",
        this::row,
        organisation);
  }

  public Optional<FarmRecord> find(UUID id, UUID organisation) {
    return jdbc
        .query("SELECT * FROM farm WHERE id=? AND organisation_id=?", this::row, id, organisation)
        .stream()
        .findFirst();
  }

  public Optional<FarmRecord> lock(UUID id, UUID organisation) {
    return jdbc
        .query(
            "SELECT * FROM farm WHERE id=? AND organisation_id=? FOR UPDATE",
            this::row,
            id,
            organisation)
        .stream()
        .findFirst();
  }

  public void correct(UUID id, UUID organisation, CorrectionInput input) {
    jdbc.update(
        """
      UPDATE farm SET crop=?,stage=?,area_hectares=?,assets=?,boundary=?::jsonb,
      version=version+1,updated_at=clock_timestamp() WHERE id=? AND organisation_id=?
      """,
        input.crop(),
        input.stage(),
        input.areaHectares(),
        input.assets().trim(),
        encode(input.boundary()),
        id,
        organisation);
  }

  public Optional<FarmRecord> replay(FarmInput input, UUID organisation, String hash) {
    var existing =
        jdbc.queryForList(
            "SELECT id, request_hash FROM farm WHERE organisation_id=? AND request_id=?",
            organisation,
            input.requestId());
    if (existing.isEmpty()) return Optional.empty();
    if (!hash.equals(existing.getFirst().get("request_hash"))) {
      throw new com.terrafort.config.ApiException(
          org.springframework.http.HttpStatus.CONFLICT,
          "REQUEST_CONFLICT",
          "This request identifier already belongs to a different registration.");
    }
    return find((UUID) existing.getFirst().get("id"), organisation);
  }

  public UUID insert(FarmInput input, UUID organisation, String hash) {
    UUID id = UUID.randomUUID();
    jdbc.update(
        """
        INSERT INTO farm (id, organisation_id, farmer_name, village, district, crop, stage,
        area_hectares, assets, boundary, consent_version, consent_at, request_id, request_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, now(), ?, ?)
        """,
        id,
        organisation,
        input.farmerName().trim(),
        input.village().trim(),
        input.district().trim(),
        input.crop(),
        input.stage(),
        input.areaHectares(),
        input.assets().trim(),
        encode(input.boundary()),
        input.consentVersion(),
        input.requestId(),
        hash);
    return id;
  }

  public String encode(Object value) {
    try {
      return mapper.writeValueAsString(value);
    } catch (Exception error) {
      throw new IllegalStateException("Cannot encode farm record", error);
    }
  }

  private FarmRecord row(ResultSet row, int index) throws SQLException {
    List<FarmInput.Point> boundary;
    try {
      boundary = mapper.readValue(row.getString("boundary"), new TypeReference<>() {});
    } catch (Exception error) {
      throw new SQLException("Cannot read stored plot boundary", error);
    }
    return new FarmRecord(
        row.getObject("id", UUID.class),
        row.getString("farmer_name"),
        row.getString("village"),
        row.getString("district"),
        row.getString("crop"),
        row.getString("stage"),
        row.getBigDecimal("area_hectares"),
        row.getString("assets"),
        boundary,
        row.getString("consent_version"),
        row.getTimestamp("consent_at").toInstant(),
        row.getTimestamp("created_at").toInstant(),
        row.getInt("version"),
        row.getTimestamp("updated_at").toInstant());
  }
}

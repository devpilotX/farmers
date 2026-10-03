package com.terrafort;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.terrafort.farm.FarmInput;
import com.terrafort.farm.FarmService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(FoundationIntegrationTest.Tokens.class)
class CorrectionIntegrationTest {
  @Autowired MockMvc http;
  @Autowired JdbcTemplate jdbc;
  @Autowired ObjectMapper mapper;
  @Autowired FarmService farms;
  private final UUID organisation = UUID.fromString("00000000-0000-0000-0000-000000000002");
  private FarmInput registration;
  private UUID farm;

  @BeforeEach
  void createFarm() {
    jdbc.execute("TRUNCATE audit_event, action_task, farm CASCADE");
    registration =
        new FarmInput(
            UUID.randomUUID(),
            "Sample Farmer",
            "Sample Village",
            "Sample District",
            "Paddy",
            "Growing",
            new BigDecimal("1.25"),
            "One pump",
            List.of(
                new FarmInput.Point(86.1, 25.9),
                new FarmInput.Point(86.2, 25.9),
                new FarmInput.Point(86.2, 26.0),
                new FarmInput.Point(86.1, 25.9)),
            true,
            "registry-v1-en");
    farm = farms.create(registration, organisation).id();
  }

  private RequestPostProcessor authorised(UUID tenant) {
    return jwt()
        .jwt(token -> token.claim("organisation_id", tenant.toString()))
        .authorities(new SimpleGrantedAuthority("SCOPE_farms:write"));
  }

  private ObjectNode correction() {
    ObjectNode body = mapper.createObjectNode();
    body.put("requestId", UUID.randomUUID().toString());
    body.put("expectedVersion", 1);
    body.put("reason", "Corrected the reported crop after review");
    body.put("reviewed", true);
    body.put("crop", "Maize");
    body.put("stage", "Growing");
    body.put("areaHectares", 1.25);
    body.put("assets", "One pump");
    body.set("boundary", mapper.valueToTree(registration.boundary()));
    return body;
  }

  private org.springframework.test.web.servlet.ResultActions save(ObjectNode body)
      throws Exception {
    return http.perform(
        put("/api/v1/farms/" + farm)
            .with(authorised(organisation))
            .contentType(MediaType.APPLICATION_JSON)
            .content(body.toString()));
  }

  @Test
  void correctionPreservesIdentityPermissionChecklistAndRegistrationReplay() throws Exception {
    var before = farms.find(farm, organisation);
    jdbc.update("UPDATE action_task SET completed=true WHERE farm_id=?", farm);
    save(correction())
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.crop").value("Maize"))
        .andExpect(jsonPath("$.version").value(2))
        .andExpect(jsonPath("$.updatedAt").isString());
    var after = farms.find(farm, organisation);
    assertEquals(before.farmerName(), after.farmerName());
    assertEquals(before.village(), after.village());
    assertEquals(before.district(), after.district());
    assertEquals(before.consentAt(), after.consentAt());
    assertEquals(before.consentVersion(), after.consentVersion());
    assertEquals(before.createdAt(), after.createdAt());
    assertEquals(
        3, jdbc.queryForObject("SELECT count(*) FROM action_task WHERE completed", Integer.class));
    var replay = farms.create(registration, organisation);
    assertEquals(farm, replay.id());
    assertEquals("Maize", replay.crop());
    http.perform(get("/api/v1/farms/" + farm + "/history").with(authorised(organisation)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].eventType").value("FARM_CORRECTED"))
        .andExpect(jsonPath("$[0].changedFields[0]").value("crop"))
        .andExpect(jsonPath("$[0].recordVersion").value(2))
        .andExpect(jsonPath("$[1].changedFields.length()").value(0));
  }

  @Test
  void matchingRetryWritesOnceAndChangedBodyWithSameKeyFails() throws Exception {
    var body = correction();
    save(body).andExpect(status().isOk());
    save(body).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
    body.put("assets", "Different equipment");
    save(body)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("REQUEST_CONFLICT"));
    assertEquals(
        1,
        jdbc.queryForObject(
            "SELECT count(*) FROM audit_event WHERE event_type='FARM_CORRECTED'", Integer.class));
  }

  @Test
  void staleVersionDoesNotOverwriteAConfirmedCorrection() throws Exception {
    save(correction()).andExpect(status().isOk());
    var stale = correction();
    stale.put("crop", "Vegetables");
    save(stale)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("VERSION_CONFLICT"));
    assertEquals("Maize", farms.find(farm, organisation).crop());
  }

  @Test
  void concurrentDifferentRequestsAcceptExactlyOneVersion() throws Exception {
    var first = correction();
    var second = correction();
    second.put("crop", "Vegetables");
    try (var executor = Executors.newFixedThreadPool(2)) {
      var a = executor.submit(() -> save(first).andReturn().getResponse().getStatus());
      var b = executor.submit(() -> save(second).andReturn().getResponse().getStatus());
      assertEquals(
          List.of(200, 409), java.util.stream.Stream.of(a.get(), b.get()).sorted().toList());
    }
    assertEquals(
        1,
        jdbc.queryForObject(
            "SELECT count(*) FROM audit_event WHERE event_type='FARM_CORRECTED'", Integer.class));
  }

  @Test
  void foreignOrganisationCannotCorrectOrReadHistory() throws Exception {
    var other = authorised(UUID.randomUUID());
    http.perform(
            put("/api/v1/farms/" + farm)
                .with(other)
                .contentType(MediaType.APPLICATION_JSON)
                .content(correction().toString()))
        .andExpect(status().isNotFound());
    http.perform(get("/api/v1/farms/" + farm + "/history").with(other))
        .andExpect(status().isNotFound());
  }

  @Test
  void correctionAndHistoryRequireTokenAndScope() throws Exception {
    http.perform(
            put("/api/v1/farms/" + farm)
                .contentType(MediaType.APPLICATION_JSON)
                .content(correction().toString()))
        .andExpect(status().isUnauthorized());
    http.perform(get("/api/v1/farms/" + farm + "/history").with(jwt()))
        .andExpect(status().isForbidden());
  }

  @Test
  void unreviewedBlankReasonAndIdentityEditsAreRejected() throws Exception {
    var body = correction();
    body.put("reviewed", false);
    save(body).andExpect(status().isBadRequest());
    body.put("reviewed", true);
    body.put("reason", " ");
    save(body).andExpect(status().isBadRequest());
    body.put("reason", "Reviewed crop");
    body.put("farmerName", "Another person");
    save(body).andExpect(status().isBadRequest());
    assertEquals("Paddy", farms.find(farm, organisation).crop());
  }

  @Test
  void invalidBoundaryAndAreaLeaveRecordUnchanged() throws Exception {
    var body = correction();
    body.put("areaHectares", 0);
    save(body).andExpect(status().isBadRequest());
    body.put("areaHectares", 1.25);
    ((ObjectNode) body.get("boundary").get(3)).put("longitude", 86.3);
    save(body)
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_BOUNDARY"));
    assertEquals("Paddy", farms.find(farm, organisation).crop());
  }

  @Test
  void noChangeIsNotRecordedAsACorrection() throws Exception {
    var body = correction();
    body.put("crop", "Paddy");
    body.put("assets", " One pump ");
    save(body).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("NO_CHANGES"));
    assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class));
  }

  @Test
  void historyIsBoundedToLatestHundredEvents() throws Exception {
    jdbc.update(
        "INSERT INTO audit_event (id,organisation_id,farm_id,event_type) SELECT gen_random_uuid(),?,?, 'TASK_UPDATED' FROM generate_series(1,110)",
        organisation,
        farm);
    http.perform(get("/api/v1/farms/" + farm + "/history").with(authorised(organisation)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(100));
  }

  @Test
  void concurrentMatchingCorrectionRetriesWriteOnlyOnce() throws Exception {
    var body = correction();
    try (var executor = Executors.newFixedThreadPool(2)) {
      var first = executor.submit(() -> save(body).andReturn().getResponse().getStatus());
      var second = executor.submit(() -> save(body).andReturn().getResponse().getStatus());
      assertEquals(200, first.get());
      assertEquals(200, second.get());
    }
    assertEquals(
        2, jdbc.queryForObject("SELECT version FROM farm WHERE id=?", Integer.class, farm));
    assertEquals(
        1,
        jdbc.queryForObject(
            "SELECT count(*) FROM audit_event WHERE event_type='FARM_CORRECTED'", Integer.class));
  }

  @Test
  void failedAuditWriteRollsBackTheFarmCorrection() throws Exception {
    jdbc.execute(
        "CREATE FUNCTION reject_test_correction() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''test audit failure''; END'");
    jdbc.execute(
        "CREATE TRIGGER reject_test_correction BEFORE INSERT ON audit_event FOR EACH ROW WHEN (NEW.event_type = 'FARM_CORRECTED') EXECUTE FUNCTION reject_test_correction()");
    try {
      save(correction())
          .andExpect(status().isInternalServerError())
          .andExpect(jsonPath("$.code").value("SERVICE_ERROR"));
      assertEquals("Paddy", farms.find(farm, organisation).crop());
      assertEquals(
          1, jdbc.queryForObject("SELECT version FROM farm WHERE id=?", Integer.class, farm));
      assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class));
    } finally {
      jdbc.execute("DROP TRIGGER reject_test_correction ON audit_event");
      jdbc.execute("DROP FUNCTION reject_test_correction()");
    }
  }

  @Test
  void correctionKeyCannotBeReusedForAnotherFarm() throws Exception {
    var body = correction();
    save(body).andExpect(status().isOk());
    farm =
        farms
            .create(
                new FarmInput(
                    UUID.randomUUID(),
                    registration.farmerName(),
                    registration.village(),
                    registration.district(),
                    registration.crop(),
                    registration.stage(),
                    registration.areaHectares(),
                    registration.assets(),
                    registration.boundary(),
                    true,
                    registration.consentVersion()),
                organisation)
            .id();
    save(body)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("REQUEST_CONFLICT"));
    assertEquals("Paddy", farms.find(farm, organisation).crop());
  }

  @Test
  void allEditableFieldsAreRecordedAndLaterRetryDoesNotRestoreOldValues() throws Exception {
    var first = correction();
    first.put("stage", "Ready to harvest");
    first.put("areaHectares", 2.5);
    first.put("assets", "Two pumps");
    ((ObjectNode) first.get("boundary").get(1)).put("longitude", 86.3);
    save(first).andExpect(status().isOk());
    http.perform(get("/api/v1/farms/" + farm + "/history").with(authorised(organisation)))
        .andExpect(jsonPath("$[0].changedFields.length()").value(5));
    var second = first.deepCopy();
    second.put("requestId", UUID.randomUUID().toString());
    second.put("expectedVersion", 2);
    second.put("assets", "Three pumps");
    save(second).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(3));
    save(first)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.assets").value("Three pumps"))
        .andExpect(jsonPath("$.version").value(3));
    assertEquals(
        2,
        jdbc.queryForObject(
            "SELECT count(*) FROM audit_event WHERE event_type='FARM_CORRECTED'", Integer.class));
  }
}

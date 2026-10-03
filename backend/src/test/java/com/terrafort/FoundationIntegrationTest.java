package com.terrafort;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FoundationIntegrationTest {
  @Autowired MockMvc http;
  @Autowired JdbcTemplate jdbc;
  @Autowired ObjectMapper mapper;
  @Autowired FarmService farms;
  private final UUID organisation = UUID.fromString("00000000-0000-0000-0000-000000000002");

  @TestConfiguration
  static class Tokens {
    @Bean
    JwtDecoder jwtDecoder() {
      return token -> {
        throw new JwtException("No real tokens accepted by tests");
      };
    }
  }

  @BeforeEach
  void cleanDatabase() {
    jdbc.execute("TRUNCATE audit_event, action_task, farm CASCADE");
  }

  private RequestPostProcessor authorised(UUID tenant) {
    return jwt()
        .jwt(token -> token.claim("organisation_id", tenant.toString()))
        .authorities(new SimpleGrantedAuthority("SCOPE_farms:write"));
  }

  private FarmInput input(UUID request) {
    return new FarmInput(
        request,
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
  }

  @Test
  void registrationPersistsConsentBoundaryAndThreeTasks() throws Exception {
    var request = input(UUID.randomUUID());
    var result =
        http.perform(
                post("/api/v1/farms")
                    .with(authorised(organisation))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.consentVersion").value("registry-v1-en"))
            .andExpect(jsonPath("$.boundary.length()").value(4))
            .andReturn();
    var id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    http.perform(get("/api/v1/farms/" + id + "/tasks").with(authorised(organisation)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3));
    assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class));
  }

  @Test
  void duplicateRegistrationReturnsSameRecordAndConflictingBodyIsRejected() throws Exception {
    UUID request = UUID.randomUUID();
    var first = farms.create(input(request), organisation);
    assertEquals(first.id(), farms.create(input(request), organisation).id());
    var body = mapper.valueToTree(input(request));
    ((com.fasterxml.jackson.databind.node.ObjectNode) body).put("farmerName", "A different farmer");
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("REQUEST_CONFLICT"));
    assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM farm", Integer.class));
  }

  @Test
  void concurrentIdenticalRegistrationCreatesOnlyOneFarm() throws Exception {
    var request = input(UUID.randomUUID());
    try (var executor = Executors.newFixedThreadPool(2)) {
      var first = executor.submit(() -> farms.create(request, organisation));
      var second = executor.submit(() -> farms.create(request, organisation));
      assertEquals(first.get().id(), second.get().id());
    }
    assertEquals(3, jdbc.queryForObject("SELECT count(*) FROM action_task", Integer.class));
  }

  @Test
  void anotherOrganisationCannotReadOrModifyFarm() throws Exception {
    var farm = farms.create(input(UUID.randomUUID()), organisation);
    UUID other = UUID.randomUUID();
    http.perform(get("/api/v1/farms/" + farm.id()).with(authorised(other)))
        .andExpect(status().isNotFound());
    http.perform(get("/api/v1/farms").with(authorised(other)))
        .andExpect(jsonPath("$.length()").value(0));
    http.perform(
            put("/api/v1/farms/" + farm.id() + "/tasks/" + UUID.randomUUID())
                .with(authorised(other))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"completed\":true}"))
        .andExpect(status().isNotFound());
  }

  @Test
  void missingTokenAndMissingScopeAreRejected() throws Exception {
    http.perform(get("/api/v1/farms")).andExpect(status().isUnauthorized());
    http.perform(get("/api/v1/farms").with(jwt())).andExpect(status().isForbidden());
  }

  @Test
  void malformedOrganisationClaimIsRejected() throws Exception {
    http.perform(
            get("/api/v1/farms")
                .with(
                    jwt()
                        .jwt(token -> token.claim("organisation_id", "invalid"))
                        .authorities(new SimpleGrantedAuthority("SCOPE_farms:write"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.code").value("ORGANISATION_REQUIRED"));
  }

  @Test
  void consentFalseOrMissingCannotBeSaved() throws Exception {
    for (String value : List.of("false", "null")) {
      String body =
          mapper
              .writeValueAsString(input(UUID.randomUUID()))
              .replace("\"consent\":true", "\"consent\":" + value);
      http.perform(
              post("/api/v1/farms")
                  .with(authorised(organisation))
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(body))
          .andExpect(status().isBadRequest());
    }
    assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM farm", Integer.class));
  }

  @Test
  void invalidGeometryAndAreaAreRejectedWithoutPartialWrites() throws Exception {
    var body =
        (com.fasterxml.jackson.databind.node.ObjectNode)
            mapper.valueToTree(input(UUID.randomUUID()));
    body.put("areaHectares", 0);
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isBadRequest());
    body.put("areaHectares", 1);
    body.set(
        "boundary",
        mapper.readTree(
            "[{\"longitude\":86.1,\"latitude\":25.9},{\"longitude\":86.2,\"latitude\":26},{\"longitude\":86.2,\"latitude\":25.9},{\"longitude\":86.1,\"latitude\":26},{\"longitude\":86.1,\"latitude\":25.9}]"));
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_BOUNDARY"));
    assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM action_task", Integer.class));
  }

  @Test
  void completionSurvivesReadAndRetryDoesNotDuplicateAudit() throws Exception {
    var farm = farms.create(input(UUID.randomUUID()), organisation);
    UUID task =
        jdbc.queryForObject(
            "SELECT id FROM action_task WHERE farm_id=? ORDER BY position LIMIT 1",
            UUID.class,
            farm.id());
    for (int attempt = 0; attempt < 2; attempt++) {
      http.perform(
              put("/api/v1/farms/" + farm.id() + "/tasks/" + task)
                  .with(authorised(organisation))
                  .contentType(MediaType.APPLICATION_JSON)
                  .content("{\"completed\":true}"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.completed").value(true));
    }
    assertEquals(
        1,
        jdbc.queryForObject(
            "SELECT count(*) FROM audit_event WHERE event_type='TASK_UPDATED'", Integer.class));
  }

  @Test
  void taskFromAnotherFarmCannotBeModified() throws Exception {
    var first = farms.create(input(UUID.randomUUID()), organisation);
    var second = farms.create(input(UUID.randomUUID()), organisation);
    UUID task =
        jdbc.queryForObject(
            "SELECT id FROM action_task WHERE farm_id=? ORDER BY position LIMIT 1",
            UUID.class,
            second.id());
    http.perform(
            put("/api/v1/farms/" + first.id() + "/tasks/" + task)
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"completed\":true}"))
        .andExpect(status().isNotFound());
  }

  @Test
  void databaseHealthEndpointIsAvailable() throws Exception {
    http.perform(get("/actuator/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("UP"));
  }

  @Test
  void unknownPropertiesAndMalformedIdentifiersReturnSafeErrors() throws Exception {
    http.perform(get("/api/v1/farms/not-a-uuid").with(authorised(organisation)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.requestId").isString());
    var body =
        (com.fasterxml.jackson.databind.node.ObjectNode)
            mapper.valueToTree(input(UUID.randomUUID()));
    body.put("organisation_id", UUID.randomUUID().toString());
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void missingBoundaryCoordinateAndOutOfRangeCoordinateAreRejected() throws Exception {
    var body =
        (com.fasterxml.jackson.databind.node.ObjectNode)
            mapper.valueToTree(input(UUID.randomUUID()));
    ((com.fasterxml.jackson.databind.node.ObjectNode) body.get("boundary").get(1))
        .remove("longitude");
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isBadRequest());
    ((com.fasterxml.jackson.databind.node.ObjectNode) body.get("boundary").get(1))
        .put("longitude", 181);
    http.perform(
            post("/api/v1/farms")
                .with(authorised(organisation))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.toString()))
        .andExpect(status().isBadRequest());
  }
}

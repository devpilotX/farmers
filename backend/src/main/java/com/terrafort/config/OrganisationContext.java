package com.terrafort.config;

import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class OrganisationContext {
  private final Environment environment;
  public static final UUID DEMO_ORGANISATION =
      UUID.fromString("00000000-0000-0000-0000-000000000001");

  public OrganisationContext(Environment environment) {
    this.environment = environment;
  }

  public UUID current() {
    if (environment.matchesProfiles("local")) return DEMO_ORGANISATION;
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication instanceof JwtAuthenticationToken token) {
      try {
        return UUID.fromString(token.getToken().getClaimAsString("organisation_id"));
      } catch (IllegalArgumentException | NullPointerException error) {
        /* Deny malformed tenant claims. */
      }
    }
    throw new ApiException(
        HttpStatus.FORBIDDEN, "ORGANISATION_REQUIRED", "A valid organisation is required.");
  }
}

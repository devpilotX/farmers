package com.terrafort.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class LocalProfileGuard {
  public LocalProfileGuard(Environment environment) {
    if (environment.matchesProfiles("local") && environment.matchesProfiles("prod")) {
      throw new IllegalStateException("The local profile cannot be combined with prod.");
    }
    if (environment.matchesProfiles("local")
        && !java.util.Set.of("127.0.0.1", "localhost", "::1")
            .contains(environment.getProperty("server.address", "127.0.0.1"))) {
      throw new IllegalStateException("The local profile must bind to loopback.");
    }
  }
}

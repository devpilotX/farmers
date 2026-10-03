package com.terrafort;

import static org.junit.jupiter.api.Assertions.*;

import com.terrafort.config.LocalProfileGuard;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class LocalProfileGuardTest {
  @Test
  void localCannotBeCombinedWithProduction() {
    var environment = new MockEnvironment();
    environment.setActiveProfiles("local", "prod");
    assertThrows(IllegalStateException.class, () -> new LocalProfileGuard(environment));
  }

  @Test
  void localCannotBindToAllNetworkInterfaces() {
    var environment = new MockEnvironment().withProperty("server.address", "0.0.0.0");
    environment.setActiveProfiles("local");
    assertThrows(IllegalStateException.class, () -> new LocalProfileGuard(environment));
  }

  @Test
  void localAcceptsLoopbackBinding() {
    var environment = new MockEnvironment().withProperty("server.address", "127.0.0.1");
    environment.setActiveProfiles("local");
    assertDoesNotThrow(() -> new LocalProfileGuard(environment));
  }
}

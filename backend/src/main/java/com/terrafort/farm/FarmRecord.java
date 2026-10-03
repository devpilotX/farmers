package com.terrafort.farm;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FarmRecord(
    UUID id,
    String farmerName,
    String village,
    String district,
    String crop,
    String stage,
    BigDecimal areaHectares,
    String assets,
    List<FarmInput.Point> boundary,
    String consentVersion,
    Instant consentAt,
    Instant createdAt,
    int version,
    Instant updatedAt) {}

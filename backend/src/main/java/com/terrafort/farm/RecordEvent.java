package com.terrafort.farm;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecordEvent(
    UUID id,
    String eventType,
    Instant recordedAt,
    Integer recordVersion,
    List<String> changedFields,
    String reason) {}

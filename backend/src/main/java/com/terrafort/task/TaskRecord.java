package com.terrafort.task;

import java.time.Instant;
import java.util.UUID;

public record TaskRecord(
    UUID id, UUID farmId, String title, String detail, boolean completed, Instant updatedAt) {}

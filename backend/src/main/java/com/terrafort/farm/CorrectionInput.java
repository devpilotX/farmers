package com.terrafort.farm;

import com.terrafort.farm.FarmInput.Point;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CorrectionInput(
    @NotNull UUID requestId,
    @NotNull @Min(1) Integer expectedVersion,
    @NotBlank @Size(max = 300) String reason,
    @NotNull @AssertTrue Boolean reviewed,
    @NotNull @Pattern(regexp = "Paddy|Maize|Vegetables") String crop,
    @NotNull @Pattern(regexp = "Sowing|Growing|Ready to harvest") String stage,
    @NotNull @DecimalMin("0.01") @DecimalMax("10000") @Digits(integer = 5, fraction = 2)
        BigDecimal areaHectares,
    @NotNull @Size(max = 500) String assets,
    @NotNull @Size(min = 4, max = 100) List<@NotNull @Valid Point> boundary) {
  public List<String> changedFields(FarmRecord farm) {
    var fields = new java.util.ArrayList<String>();
    if (!crop.equals(farm.crop())) fields.add("crop");
    if (!stage.equals(farm.stage())) fields.add("stage");
    if (areaHectares.compareTo(farm.areaHectares()) != 0) fields.add("areaHectares");
    if (!assets.trim().equals(farm.assets())) fields.add("assets");
    if (!boundary.equals(farm.boundary())) fields.add("boundary");
    return List.copyOf(fields);
  }
}

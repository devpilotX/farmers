package com.terrafort.farm;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record FarmInput(
    @NotNull UUID requestId,
    @NotBlank @Size(max = 100) String farmerName,
    @NotBlank @Size(max = 100) String village,
    @NotBlank @Size(max = 100) String district,
    @NotNull @Pattern(regexp = "Paddy|Maize|Vegetables") String crop,
    @NotNull @Pattern(regexp = "Sowing|Growing|Ready to harvest") String stage,
    @NotNull @DecimalMin("0.01") @DecimalMax("10000") @Digits(integer = 5, fraction = 2)
        BigDecimal areaHectares,
    @NotNull @Size(max = 500) String assets,
    @NotNull @Size(min = 4, max = 100) List<@NotNull @Valid Point> boundary,
    @NotNull @AssertTrue Boolean consent,
    @NotNull @Pattern(regexp = "registry-v1-en") String consentVersion) {
  public record Point(
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double longitude,
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double latitude) {}
}

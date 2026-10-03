package com.terrafort.farm;

import com.terrafort.config.OrganisationContext;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farms/{farm}")
public class CorrectionController {
  private final CorrectionService corrections;
  private final OrganisationContext organisation;

  public CorrectionController(CorrectionService corrections, OrganisationContext organisation) {
    this.corrections = corrections;
    this.organisation = organisation;
  }

  @PutMapping
  public FarmRecord correct(@PathVariable UUID farm, @Valid @RequestBody CorrectionInput input) {
    return corrections.correct(farm, organisation.current(), input);
  }

  @GetMapping("/history")
  public List<RecordEvent> history(@PathVariable UUID farm) {
    return corrections.history(farm, organisation.current());
  }
}

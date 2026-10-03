package com.terrafort.farm;

import com.terrafort.config.ApiException;
import java.util.List;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class BoundaryValidator {
  public void validate(List<FarmInput.Point> points) {
    if (!points.getFirst().equals(points.getLast())) fail();
    Coordinate[] coordinates =
        points.stream()
            .map(point -> new Coordinate(point.longitude(), point.latitude()))
            .toArray(Coordinate[]::new);
    var polygon = new GeometryFactory().createPolygon(coordinates);
    if (!polygon.isValid() || polygon.getArea() <= 0) fail();
  }

  private void fail() {
    throw new ApiException(
        HttpStatus.BAD_REQUEST,
        "INVALID_BOUNDARY",
        "Use a closed, non-crossing plot boundary with at least three distinct corners.");
  }
}

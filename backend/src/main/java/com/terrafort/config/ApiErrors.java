package com.terrafort.config;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> domain(ApiException error, HttpServletRequest request) {
    return response(error.status(), error.code(), error.getMessage(), request);
  }

  @ExceptionHandler({
    MethodArgumentNotValidException.class,
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class
  })
  ResponseEntity<?> invalid(Exception error, HttpServletRequest request) {
    return response(
        HttpStatus.BAD_REQUEST,
        "INVALID_INPUT",
        "Check the required fields and plot boundary, then try again.",
        request);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unexpected(Exception error, HttpServletRequest request) {
    return response(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "SERVICE_ERROR",
        "The record could not be saved. Retry with the same request identifier.",
        request);
  }

  private ResponseEntity<?> response(
      HttpStatus status, String code, String message, HttpServletRequest request) {
    return ResponseEntity.status(status)
        .body(
            Map.of(
                "code", code, "message", message, "requestId", request.getAttribute("requestId")));
  }
}

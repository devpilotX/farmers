package com.terrafort.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestGuard extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String requestId = UUID.randomUUID().toString();
    request.setAttribute("requestId", requestId);
    response.setHeader("X-Request-Id", requestId);
    response.setHeader("Cache-Control", "no-store");
    if (request.getContentLengthLong() > 65536) {
      response.setStatus(413);
      response.setContentType("application/json");
      response
          .getWriter()
          .write(
              "{\"code\":\"PAYLOAD_TOO_LARGE\",\"message\":\"The request exceeds 64KB.\",\"requestId\":\""
                  + requestId
                  + "\"}");
      return;
    }
    chain.doFilter(request, response);
  }
}

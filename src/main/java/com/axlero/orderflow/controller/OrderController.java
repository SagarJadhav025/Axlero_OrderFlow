package com.axlero.orderflow.controller;

import com.axlero.orderflow.helper.OrderRequest;
import com.axlero.orderflow.engine.SecureOrderPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Locale;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final SecureOrderPublisher publisher;

    public OrderController(SecureOrderPublisher publisher) {
        this.publisher = publisher;
    }

    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        if (request.getOrderId() == null || request.getOrderId().isBlank()
                || request.getSide() == null || request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Order ID, side, and a positive quantity are required.");
        }

        String orderType = request.getOrderType() == null
                ? "LIMIT"
                : request.getOrderType().trim().toUpperCase(Locale.ROOT);
        if (!orderType.equals("LIMIT") && !orderType.equals("MARKET")) {
            return ResponseEntity.badRequest().body("Order type must be LIMIT or MARKET.");
        }
        if (orderType.equals("LIMIT") && request.getPrice() <= 0) {
            return ResponseEntity.badRequest().body("Limit orders require a positive price.");
        }

        publisher.publishOrder(
                request.getOrderId(),
                request.getSide(),
                orderType,
                request.getPrice(),
                request.getQuantity()
        );
        return ResponseEntity.accepted().body("Order successfully sent to Axlero Engine!");
    }
}
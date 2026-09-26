package com.axlero.orderflow.controller;

import com.axlero.orderflow.helper.OrderRequest;
import com.axlero.orderflow.engine.SecureOrderPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final SecureOrderPublisher publisher;

    public OrderController(SecureOrderPublisher publisher) {
        this.publisher = publisher;
    }

    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        publisher.publishOrder(request.getOrderId(), request.getSide(), request.getPrice(), request.getQuantity());
        return ResponseEntity.accepted().body("Order successfully sent to Axlero Engine!");
    }
}
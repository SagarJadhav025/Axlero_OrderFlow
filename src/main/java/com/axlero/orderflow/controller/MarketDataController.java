package com.axlero.orderflow.controller;

import com.axlero.orderflow.engine.OrderEventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class MarketDataController {

    @Autowired
    private OrderEventHandler orderEventHandler;

    @GetMapping("/api/orderbook")
    public Map<String, Object> getLiveOrderBook() {
        return Map.of(
                "status", "Live",
                "bids", orderEventHandler.getTopBids(),
                "asks", orderEventHandler.getTopAsks()
        );
    }
}
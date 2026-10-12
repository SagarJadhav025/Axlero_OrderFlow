
package com.axlero.orderflow.service;

import com.axlero.orderflow.engine.OrderEventHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class Level2BroadcastService {

    private final OrderEventHandler orderEventHandler;
    private final SimpMessagingTemplate messagingTemplate;

    public Level2BroadcastService(
            OrderEventHandler orderEventHandler,
            SimpMessagingTemplate messagingTemplate) {
        this.orderEventHandler = orderEventHandler;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 100)
    public void broadcastOrderBook() {
        Map<String, Object> snapshot = Map.of(
                "bids", orderEventHandler.getTopBids(),
                "asks", orderEventHandler.getTopAsks()
        );

        messagingTemplate.convertAndSend(
                "/topic/orderbook",
                snapshot,
                Map.of()
        );
    }
}

package com.axlero.orderflow.service.market;

import com.axlero.orderflow.service.MarketDataService;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.*;
import reactor.core.publisher.Mono;

@Component
public class MarketDataWebSocketHandler implements WebSocketHandler {

    private final MarketDataService service;

    public MarketDataWebSocketHandler(MarketDataService service) {
        this.service = service;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {

        return session.send(
                service.stream()
                        .map(trade -> session.textMessage(
                                trade.getBuyOrderId() +
                                        " ↔ " +
                                        trade.getSellOrderId() +
                                        " Qty=" +
                                        trade.getQuantity() +
                                        " Price=" +
                                        trade.getPrice()
                        ))
        );
    }
}

package com.axlero.orderflow.service;

import com.axlero.orderflow.helper.TradeEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class MarketDataService {

    private final Sinks.Many<TradeEvent> sink =
            Sinks.many().multicast().onBackpressureBuffer();

    public void publishTrade(TradeEvent trade) {
        sink.tryEmitNext(trade);
    }

    public Flux<TradeEvent> stream() {
        return sink.asFlux();
    }
}

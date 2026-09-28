package com.axlero.orderflow.service;


import com.axlero.orderflow.helper.TradeEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderConsumer {

    @KafkaListener(
            topics = "orders-topic",
            groupId = "order-group"
    )
    public void consume(TradeEvent event) {

        System.out.println(
                "TRADE RECEIVED: " +
                        "BUY=" + event.getBuyOrderId() +
                        " | SELL=" + event.getSellOrderId() +
                        " | Quantity=" + event.getQuantity() +
                        " | Price=$" + event.getPrice()
        );
    }
}

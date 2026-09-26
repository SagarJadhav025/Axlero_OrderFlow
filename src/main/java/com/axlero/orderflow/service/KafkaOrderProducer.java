package com.axlero.orderflow.service;





import com.axlero.orderflow.helper.TradeEvent;
import lombok.Data;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaOrderProducer {

    private final KafkaTemplate<String, TradeEvent> kafkaTemplate;

    public KafkaOrderProducer(
            KafkaTemplate<String, TradeEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }


    public void publishTrade(
            String buyOrderId,
            String sellOrderId,
            int quantity,
            double price) {

        TradeEvent tradeEvent = new TradeEvent(
                buyOrderId,
                sellOrderId,
                quantity,
                price
        );

        kafkaTemplate.send(
                "orders-topic",
                buyOrderId,
                tradeEvent
        );
    }
}

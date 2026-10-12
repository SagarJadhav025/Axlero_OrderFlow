
package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;
import com.axlero.orderflow.service.PreTradeRiskService;
import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import org.springframework.stereotype.Component;

@Component
public class SecureOrderPublisher {

    private final RingBuffer<OrderEvent> ringBuffer;
    private final PreTradeRiskService riskService;

    public SecureOrderPublisher(
            Disruptor<OrderEvent> disruptor,
            PreTradeRiskService riskService) {
        this.ringBuffer = disruptor.getRingBuffer();
        this.riskService = riskService;
    }

    public void publishOrder(
            String orderId,
            OrderSide side,
            double price,
            int quantity) {
        publishOrder(orderId, side, "LIMIT", price, quantity);
    }

    public void publishOrder(
            String orderId,
            OrderSide side,
            String orderType,
            double price,
            int quantity) {

        if (orderId == null || orderId.isBlank() || side == null) {
            throw new IllegalArgumentException(
                    "Order ID and side are required.");
        }

        riskService.validateOrder(
                orderId, orderType, price, quantity);

        long sequence = ringBuffer.next();
        try {
            OrderEvent event = ringBuffer.get(sequence);
            event.setOrderId(orderId);
            event.setSide(side);
            event.setOrderType(orderType);
            event.setPrice(price);
            event.setQuantity(quantity);
        } finally {
            ringBuffer.publish(sequence);
        }
    }
}

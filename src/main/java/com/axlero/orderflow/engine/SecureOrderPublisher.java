package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;
import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import org.springframework.stereotype.Component;

@Component
public class SecureOrderPublisher {
    private final RingBuffer<OrderEvent> ringBuffer;

    public SecureOrderPublisher(Disruptor<OrderEvent> disruptor) {
        this.ringBuffer = disruptor.getRingBuffer();
    }

    public void publishOrder(String orderId, OrderSide side, double price, int quantity) {
        publishOrder(orderId, side, "LIMIT", price, quantity);
    }

    public void publishOrder(String orderId, OrderSide side, String orderType, double price, int quantity) {
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
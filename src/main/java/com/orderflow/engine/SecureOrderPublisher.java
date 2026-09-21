package com.orderflow.engine;

import com.lmax.disruptor.EventTranslatorVararg;
import com.lmax.disruptor.RingBuffer;

public class SecureOrderPublisher {
    private final RingBuffer<OrderEvent> ringBuffer;

    public SecureOrderPublisher(RingBuffer<OrderEvent> ringBuffer) {
        this.ringBuffer = ringBuffer;
    }

    private static final EventTranslatorVararg<OrderEvent> TRANSLATOR =
            (event, sequence, args) -> {
                event.setValues((long) args[0], (byte) args[1], (double) args[2], (int) args[3]);
            };

    public boolean publishOrder(long orderId, byte side, double price, int quantity) {
        // 🛡️ SECURITY 1: Block malicious or broken inputs instantly
        if (orderId <= 0 || price <= 0.0 || quantity <= 0 || (side != 1 && side != 2)) {
            System.err.println("SECURITY ALERT: Malicious or invalid order rejected.");
            return false;
        }

        // 🛡️ SECURITY 2: Anti-DDoS. Try to publish, but drop it safely if overloaded
        boolean success = ringBuffer.tryPublishEvent(TRANSLATOR, orderId, side, price, quantity);

        if (!success) {
            System.err.println("SYSTEM WARNING: System is at max capacity, order dropped safely.");
        }

        return success;
    }
}
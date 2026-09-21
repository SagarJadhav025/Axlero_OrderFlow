package com.orderflow.engine;

import com.lmax.disruptor.EventHandler;

public class OrderEventHandler implements EventHandler<OrderEvent> {

    @Override
    public void onEvent(OrderEvent event, long sequence, boolean endOfBatch) {
        try {
            // Process the order here safely
            System.out.println("Processing Secure Order ID: " + event.getOrderId());
        } finally {
            // 🛡️ SECURITY: Always wipe the data at the end of the pipeline
            event.clear();
        }
    }
}
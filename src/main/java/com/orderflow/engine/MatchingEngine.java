package com.orderflow.engine;

import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.YieldingWaitStrategy;
import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.dsl.ProducerType;
import java.util.concurrent.Executors;

public class MatchingEngine {
    public static void main(String[] args) {
        // SECURITY: Hard limit on buffer size to prevent RAM overflow attacks
        int bufferSize = 1024 * 1024;

        // Set up the Disruptor
        Disruptor<OrderEvent> disruptor = new Disruptor<>(
                new OrderEventFactory(),
                bufferSize,
                Executors.defaultThreadFactory(),
                ProducerType.MULTI,
                new YieldingWaitStrategy()
        );

        // Connect the safe processor
        disruptor.handleEventsWith(new OrderEventHandler());

        // Start the engine
        RingBuffer<OrderEvent> ringBuffer = disruptor.start();

        // Connect the secure firewall publisher
        SecureOrderPublisher publisher = new SecureOrderPublisher(ringBuffer);

        // Test the system with a good order (Should succeed)
        publisher.publishOrder(1001L, (byte) 1, 50000.50, 5);

        // Test the system with a hack attempt (Should fail safely)
        publisher.publishOrder(-5L, (byte) 3, -100.0, 0);
    }
}
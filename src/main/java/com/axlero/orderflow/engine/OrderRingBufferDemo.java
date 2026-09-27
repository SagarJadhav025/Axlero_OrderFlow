package com.axlero.orderflow.engine;

/** Small runnable example showing slot reuse when writes wrap around. */
public final class OrderRingBufferDemo {
    private OrderRingBufferDemo() { }

    public static void main(String[] args) {
        SimpleOrderRingBuffer buffer = new SimpleOrderRingBuffer(3);
        OrderEvent firstSlot = buffer.write("O-1", "BUY", "LIMIT", 101.25, 10);
        buffer.write("O-2", "SELL", "LIMIT", 102.00, 5);
        buffer.write("O-3", "BUY", "MARKET", 0.0, 2);
        OrderEvent reusedSlot = buffer.write("O-4", "SELL", "LIMIT", 103.50, 7);

        System.out.println("First slot reused: " + (firstSlot == reusedSlot));
        for (int i = 0; i < buffer.size(); i++) {
            OrderEvent event = buffer.get(i);
            System.out.printf("%s %s %s price=%.2f quantity=%d%n", event.getOrderId(),
                    event.getSide(), event.getOrderType(), event.getPrice(), event.getQuantity());
        }
    }
}

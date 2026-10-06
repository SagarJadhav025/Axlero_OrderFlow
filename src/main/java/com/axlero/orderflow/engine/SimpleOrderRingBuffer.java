package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;

/**
 * A fixed-size circular collection of reusable order event slots. Each write
 * advances to the next slot; once the last slot is reached, writing wraps to
 * slot zero and overwrites the oldest event. This simple version is intended
 * for learning and is not thread safe.
 *
 * <p>All event objects are created up front. Reusing them avoids creating a
 * new event object for every order and can reduce allocation pressure and
 * related garbage collection work. It does not eliminate JVM garbage
 * collection: other data (for example, order ID strings) may still allocate.</p>
 */
public final class SimpleOrderRingBuffer {
    private final OrderEvent[] slots;
    private int nextWriteIndex;
    private int size;

    /** Creates a buffer and preallocates every event slot. */
    public SimpleOrderRingBuffer(int capacity) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than zero");
        }
        slots = new OrderEvent[capacity];
        for (int i = 0; i < capacity; i++) {
            slots[i] = new OrderEvent();
        }
    }

    /** Writes values into the next reusable slot and returns that same slot. */
    public OrderEvent write(String orderId, OrderSide side, double price, int quantity) {
        OrderEvent slot = slots[nextWriteIndex];
        slot.set(orderId, side, price, quantity);
        nextWriteIndex = (nextWriteIndex + 1) % slots.length;
        if (size < slots.length) {
            size++;
        }
        return slot;
    }

    /** Returns an event by its logical index, oldest first; rejects absent entries. */
    public OrderEvent get(int logicalIndex) {
        if (logicalIndex < 0 || logicalIndex >= size) {
            throw new IndexOutOfBoundsException("No event at logical index " + logicalIndex);
        }
        int oldestIndex = (nextWriteIndex - size + slots.length) % slots.length;
        return slots[(oldestIndex + logicalIndex) % slots.length];
    }

    public int capacity() { return slots.length; }
    public int size() { return size; }
}

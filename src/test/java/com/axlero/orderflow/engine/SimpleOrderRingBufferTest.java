package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SimpleOrderRingBufferTest {
    @Test
    void initializesWithPreallocatedEmptySlots() {
        SimpleOrderRingBuffer buffer = new SimpleOrderRingBuffer(3);
        assertEquals(3, buffer.capacity());
        assertEquals(0, buffer.size());
        assertThrows(IndexOutOfBoundsException.class, () -> buffer.get(0));
    }

    @Test
    void writesAndRetrievesEventValues() {
        SimpleOrderRingBuffer buffer = new SimpleOrderRingBuffer(2);
        OrderEvent written = buffer.write("A-1", OrderSide.BUY, 12.5, 4);
        OrderEvent retrieved = buffer.get(0);
        assertSame(written, retrieved);
        assertEquals("A-1", retrieved.getOrderId());
        assertEquals(OrderSide.BUY, retrieved.getSide());
        assertEquals("LIMIT", retrieved.getOrderType());
        assertEquals(12.5, retrieved.getPrice());
        assertEquals(4, retrieved.getQuantity());
    }

    @Test
    void wrapsAroundAndRetainsNewestCapacityEntries() {
        SimpleOrderRingBuffer buffer = new SimpleOrderRingBuffer(2);
        buffer.write("A", OrderSide.BUY, 1, 1);
        buffer.write("B", OrderSide.SELL, 2, 2);
        buffer.write("C", OrderSide.BUY, 3, 3);
        assertEquals(2, buffer.size());
        assertEquals("B", buffer.get(0).getOrderId());
        assertEquals("C", buffer.get(1).getOrderId());
    }

    @Test
    void reusesThePreallocatedObjectAfterWrapAround() {
        SimpleOrderRingBuffer buffer = new SimpleOrderRingBuffer(1);
        OrderEvent first = buffer.write("A", OrderSide.BUY, 1, 1);
        OrderEvent second = buffer.write("B", OrderSide.SELL, 2, 2);
        assertSame(first, second);
        assertEquals("B", first.getOrderId());
    }

    @Test
    void rejectsInvalidCapacity() {
        assertThrows(IllegalArgumentException.class, () -> new SimpleOrderRingBuffer(0));
        assertThrows(IllegalArgumentException.class, () -> new SimpleOrderRingBuffer(-1));
    }
}

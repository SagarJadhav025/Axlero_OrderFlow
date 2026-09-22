package com.axlero.orderflow.engine;

import com.lmax.disruptor.EventHandler;
import java.util.PriorityQueue;
import java.util.Comparator;

public class OrderEventHandler implements EventHandler<OrderEvent> {

    // BUY side: Highest price matches first
    private final PriorityQueue<OrderRecord> buyOrders = new PriorityQueue<>(
            Comparator.comparingDouble(OrderRecord::getPrice).reversed()
    );

    // SELL side: Lowest price matches first
    private final PriorityQueue<OrderRecord> sellOrders = new PriorityQueue<>(
            Comparator.comparingDouble(OrderRecord::getPrice)
    );

    @Override
    public void onEvent(OrderEvent event, long sequence, boolean endOfBatch) {
        // 1. Copy the data safely
        OrderRecord newOrder = new OrderRecord(event.getOrderId(), event.getSide(), event.getPrice(), event.getQuantity());

        System.out.println(" Received " + newOrder.getSide() + " Order: " + newOrder.getOrderId() + " @ $" + newOrder.getPrice());

        // 2. Add to the correct side of the book
        if ("BUY".equalsIgnoreCase(newOrder.getSide())) {
            buyOrders.add(newOrder);
        } else {
            sellOrders.add(newOrder);
        }

        // 3. Run the matching logic!
        matchOrders();
    }

    private void matchOrders() {
        while (!buyOrders.isEmpty() && !sellOrders.isEmpty()) {
            OrderRecord bestBuy = buyOrders.peek();
            OrderRecord bestSell = sellOrders.peek();

            // If buyer is willing to pay equal or more than seller wants, MATCH!
            if (bestBuy.getPrice() >= bestSell.getPrice()) {
                System.out.println("✅ TRADE MATCHED: " + bestBuy.getOrderId() + " bought from " + bestSell.getOrderId() + " at $" + bestSell.getPrice());

                // Remove the filled orders from the book
                buyOrders.poll();
                sellOrders.poll();
            } else {
                // Prices don't cross yet, stop matching
                break;
            }
        }
    }
}
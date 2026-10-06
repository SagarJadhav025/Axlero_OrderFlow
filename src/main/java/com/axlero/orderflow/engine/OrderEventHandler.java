package com.axlero.orderflow.engine;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

import com.axlero.orderflow.enums.OrderSide;
// import com.axlero.orderflow.service.KafkaOrderProducer; // Muted to stop crashes
import com.lmax.disruptor.EventHandler;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

@Component
public class OrderEventHandler implements EventHandler<OrderEvent> {

    // private final KafkaOrderProducer producer; // Muted to stop crashes

    // BUY → highest price first
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final PriorityQueue<OrderRecord> buyOrders =
            new PriorityQueue<>(
                    Comparator.comparingDouble(OrderRecord::getPrice).reversed()
            );

    // SELL → lowest price first
    private final PriorityQueue<OrderRecord> sellOrders =
            new PriorityQueue<>(
                    Comparator.comparingDouble(OrderRecord::getPrice)
            );

    // public OrderEventHandler(KafkaOrderProducer producer) {
    //     this.producer = producer;
    // } // Muted so Spring Boot boots cleanly

    @Override
    public void onEvent(
            OrderEvent event,
            long sequence,
            boolean endOfBatch) {

        // Copy Disruptor event into OrderRecord
        OrderRecord order = new OrderRecord(
                event.getOrderId(),
                event.getSide(),
                event.getPrice(),
                event.getQuantity()
        );

        System.out.println(
                "Received " +
                        order.getSide() +
                        " Order: " +
                        order.getOrderId() +
                        " @ $" +
                        order.getPrice() +
                        " Qty: " +
                        order.getQuantity()
        );

        // Add order to correct order book
        if (order.getSide() == OrderSide.BUY) {
            buyOrders.add(order);
        } else if (order.getSide() == OrderSide.SELL) {
            sellOrders.add(order);
        } else {
            System.out.println("Invalid order side: " + order.getSide());
            return;
        }

        // Try to match orders
        matchOrders();

        // Broadcast the live update to the frontend!
        Object payload = Map.of(
                "bids", getTopBids(),
                "asks", getTopAsks()
        );

        messagingTemplate.convertAndSend("/topic/orderbook", payload);
    }

    private void matchOrders() {

        while (!buyOrders.isEmpty() && !sellOrders.isEmpty()) {

            OrderRecord buy = buyOrders.peek();
            OrderRecord sell = sellOrders.peek();

            // BUY price is lower than SELL price → no match
            if (buy.getPrice() < sell.getPrice()) {
                break;
            }

            // Quantity that can be traded
            int tradedQuantity = Math.min(
                    buy.getQuantity(),
                    sell.getQuantity()
            );

            // Trade price = SELL price
            double tradePrice = sell.getPrice();

            System.out.println(
                    "TRADE MATCHED: " +
                            buy.getOrderId() +
                            " ↔ " +
                            sell.getOrderId() +
                            " | Quantity: " +
                            tradedQuantity +
                            " | Price: $" +
                            tradePrice
            );

             //Publish successful trade to Kafka
             //producer.publishTrade(
             //        buy.getOrderId(),
             //        sell.getOrderId(),
             //        tradedQuantity,
             //        tradePrice
            // ); // Muted so it does not crash when producer is missing

            // Reduce remaining quantity
            buy.setQuantity(
                    buy.getQuantity() - tradedQuantity
            );

            sell.setQuantity(
                    sell.getQuantity() - tradedQuantity
            );

            // BUY completely filled
            if (buy.getQuantity() == 0) {
                buyOrders.poll();
            }

            // SELL completely filled
            if (sell.getQuantity() == 0) {
                sellOrders.poll();
            }
        }
    }

    public List<OrderRecord> getTopBids() {
        return new ArrayList<>(buyOrders);
    }

    public List<OrderRecord> getTopAsks() {
        return new ArrayList<>(sellOrders);
    }
}
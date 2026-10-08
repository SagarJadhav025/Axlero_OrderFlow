package com.axlero.orderflow.engine;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

import com.axlero.orderflow.OrderSide;
// import com.axlero.orderflow.service.KafkaOrderProducer; // Muted to stop crashes
import com.lmax.disruptor.EventHandler;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final Deque<Map<String, Object>> recentTrades = new ArrayDeque<>();

    // public OrderEventHandler(KafkaOrderProducer producer) {
    //     this.producer = producer;
    // } // Muted so Spring Boot boots cleanly

    @Override
    public synchronized void onEvent(
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

        if ("MARKET".equalsIgnoreCase(event.getOrderType())) {
            matchMarketOrder(order);
        } else {
            if (order.getSide() == OrderSide.BUY) {
                buyOrders.add(order);
            } else if (order.getSide() == OrderSide.SELL) {
                sellOrders.add(order);
            } else {
                System.out.println("Invalid order side: " + order.getSide());
                return;
            }
            matchOrders(order.getSide());
        }

        Object payload = Map.of(
                "bids", getTopBids(),
                "asks", getTopAsks()
        );

        messagingTemplate.convertAndSend("/topic/orderbook", payload);
    }

    private void matchOrders(OrderSide aggressorSide) {

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

            publishTrade(aggressorSide, tradePrice, tradedQuantity, buy, sell);

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

    private void matchMarketOrder(OrderRecord incoming) {
        PriorityQueue<OrderRecord> restingOrders = incoming.getSide() == OrderSide.BUY
                ? sellOrders
                : buyOrders;

        while (incoming.getQuantity() > 0 && !restingOrders.isEmpty()) {
            OrderRecord resting = restingOrders.peek();
            int tradedQuantity = Math.min(incoming.getQuantity(), resting.getQuantity());
            double tradePrice = resting.getPrice();

            OrderRecord buy = incoming.getSide() == OrderSide.BUY ? incoming : resting;
            OrderRecord sell = incoming.getSide() == OrderSide.SELL ? incoming : resting;
            publishTrade(incoming.getSide(), tradePrice, tradedQuantity, buy, sell);

            incoming.setQuantity(incoming.getQuantity() - tradedQuantity);
            resting.setQuantity(resting.getQuantity() - tradedQuantity);
            if (resting.getQuantity() == 0) {
                restingOrders.poll();
            }
        }
    }

    private void publishTrade(
            OrderSide aggressorSide,
            double price,
            int quantity,
            OrderRecord buy,
            OrderRecord sell
    ) {
        Map<String, Object> trade = Map.of(
                "tradeId", UUID.randomUUID().toString(),
                "side", aggressorSide.name(),
                "price", price,
                "quantity", quantity,
                "buyOrderId", buy.getOrderId(),
                "sellOrderId", sell.getOrderId(),
                "timestamp", Instant.now().toString()
        );
        recentTrades.addFirst(trade);
        while (recentTrades.size() > 25) {
            recentTrades.removeLast();
        }
        Object tradePayload = trade;
        messagingTemplate.convertAndSend("/topic/trades", tradePayload);
    }

    public synchronized List<Map<String, Object>> getRecentTrades() {
        return new ArrayList<>(recentTrades);
    }

    public synchronized List<OrderRecord> getTopBids() {
        List<OrderRecord> bids = buyOrders.stream()
                .map(order -> new OrderRecord(
                        order.getOrderId(),
                        order.getSide(),
                        order.getPrice(),
                        order.getQuantity()
                ))
                .collect(Collectors.toCollection(ArrayList::new));
        bids.sort(Comparator.comparingDouble(OrderRecord::getPrice).reversed());
        return bids;
    }

    public synchronized List<OrderRecord> getTopAsks() {
        List<OrderRecord> asks = sellOrders.stream()
                .map(order -> new OrderRecord(
                        order.getOrderId(),
                        order.getSide(),
                        order.getPrice(),
                        order.getQuantity()
                ))
                .collect(Collectors.toCollection(ArrayList::new));
        asks.sort(Comparator.comparingDouble(OrderRecord::getPrice));
        return asks;
    }
}
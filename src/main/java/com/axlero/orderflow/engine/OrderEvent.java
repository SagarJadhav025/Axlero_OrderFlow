package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;
import java.util.Locale;

public class OrderEvent {
    private String orderId;
    private OrderSide side;
    private String orderType;
    private double price;
    private int quantity;

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public OrderSide getSide() { return side; }
    public void setSide(OrderSide side) { this.side = side; }

    public void setSide(String side) {
        this.side = OrderSide.valueOf(side.trim().toUpperCase(Locale.ROOT));
    }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public void set(String orderId, String side, String orderType, double price, int quantity) {
        this.orderId = orderId;
        this.side = OrderSide.valueOf(side.trim().toUpperCase(Locale.ROOT));
        this.orderType = orderType;
        this.price = price;
        this.quantity = quantity;
    }

    public void set(String orderId, OrderSide side, double price, int quantity) {
        this.orderId = orderId;
        this.side = side;
        this.orderType = "LIMIT";
        this.price = price;
        this.quantity = quantity;
    }
}

package com.axlero.orderflow.engine;

import com.axlero.orderflow.OrderSide;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class OrderRecord {
    private String orderId;
    private OrderSide side;
    private double price;
    private int quantity;

    public OrderRecord() {
    }

    public OrderRecord(String orderId, OrderSide side, double price, int quantity) {
        this.orderId = orderId;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public OrderSide getSide() {
        return side;
    }

    public void setSide(OrderSide side) {
        this.side = side;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
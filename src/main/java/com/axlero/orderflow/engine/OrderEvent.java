package com.axlero.orderflow.engine;

public class OrderEvent {

    private String orderId;
    private String side;
    private String orderType;
    private double price;
    private int quantity;

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
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

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public void set(
            String orderId,
            String side,
            String orderType,
            double price,
            int quantity) {

        this.orderId = orderId;
        this.side = side;
        this.orderType = orderType;
        this.price = price;
        this.quantity = quantity;
    }
}
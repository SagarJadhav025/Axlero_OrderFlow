package com.axlero.orderflow.engine;

public class OrderRecord {
    private String orderId;
    private String side;
    private double price;
    private int quantity;

    public OrderRecord(String orderId, String side, double price, int quantity) {
        this.orderId = orderId;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
    }

    public String getOrderId() { return orderId; }
    public String getSide() { return side; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
}
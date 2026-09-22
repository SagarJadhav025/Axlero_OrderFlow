package com.orderflow.engine;

public class OrderEvent {
    private long orderId;
    private byte side; // 1 for BUY, 2 for SELL
    private double price;
    private int quantity;

    // Getters to read the data
    public long getOrderId() { return orderId; }
    public byte getSide() { return side; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }

    // Fast setter to update data securely
    public void setValues(long orderId, byte side, double price, int quantity) {
        this.orderId = orderId;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
    }

    //  SECURITY: Wipe data clean so it cannot be leaked from memory
    public void clear() {
        this.orderId = 0L;
        this.side = 0;
        this.price = 0.0;
        this.quantity = 0;
    }
}
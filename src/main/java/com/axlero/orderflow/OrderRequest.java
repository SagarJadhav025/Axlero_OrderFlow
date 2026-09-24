package com.axlero.orderflow;

public class OrderRequest {
    private String orderId;
    private String side;
    private double price;
    private int quantity;

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
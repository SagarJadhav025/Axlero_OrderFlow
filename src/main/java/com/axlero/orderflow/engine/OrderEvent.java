package com.axlero.orderflow.engine;

import com.axlero.orderflow.enums.OrderSide;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderEvent {

    private String orderId;
    private OrderSide side;
    private double price;
    private int quantity;


    public void set(
            String orderId,
            OrderSide side,
            double price,
            int quantity) {

        this.orderId = orderId;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
    }



}
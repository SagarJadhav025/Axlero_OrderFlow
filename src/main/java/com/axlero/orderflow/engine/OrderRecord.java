package com.axlero.orderflow.engine;

import com.axlero.orderflow.OrderSide;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRecord {
    private String orderId;
    private OrderSide side;
    private double price;
    private int quantity;


}
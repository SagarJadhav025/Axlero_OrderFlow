package com.axlero.orderflow.helper;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TradeEvent {

    private String buyOrderId;
    private String sellOrderId;
    private int quantity;
    private double price;


}

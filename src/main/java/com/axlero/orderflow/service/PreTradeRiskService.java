
package com.axlero.orderflow.service;

import org.springframework.stereotype.Service;

@Service
public class PreTradeRiskService {

    private static final double MAX_ORDER_NOTIONAL = 50_000.00;

    public void validateOrder(
            String orderId,
            String orderType,
            double price,
            int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Risk rejected order " + orderId
                            + ": quantity must be positive.");
        }

        if (!Double.isFinite(price) || price < 0) {
            throw new IllegalArgumentException(
                    "Risk rejected order " + orderId
                            + ": price must be finite and non-negative.");
        }

        if ("LIMIT".equalsIgnoreCase(orderType)) {
            if (price <= 0) {
                throw new IllegalArgumentException(
                        "Risk rejected order " + orderId
                                + ": limit price must be positive.");
            }

            double notional = price * quantity;

            if (!Double.isFinite(notional)
                    || notional > MAX_ORDER_NOTIONAL) {
                throw new IllegalArgumentException(
                        "Risk rejected order " + orderId
                                + ": notional exceeds the limit of "
                                + MAX_ORDER_NOTIONAL);
            }
        }
    }
}

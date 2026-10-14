# ⚡ OrderFlow - High-Performance Order Matching Engine

OrderFlow is a real-time, high-throughput order matching gateway designed for capital markets. Built with a lock-free architecture leveraging the **LMAX Disruptor**, **Apache Kafka**, and **WebSockets**, it matches buy/sell orders with minimal latency and streams live market depth to a modern **Vite** frontend.

---

## 🚀 Key Features

* ⚡ **Ultra-Fast Matching Engine:** Powered by LMAX Disruptor ring buffers for lock-free, sub-millisecond order execution.
* 📬 **Event Streaming:** Asynchronously publishes executed trades to Apache Kafka brokers.
* 📊 **Live Order Book & Trades:** Real-time updates pushed to the web client via WebSockets (STOMP).
* 🛡️ **UI Throttling & Buffer Protection:** Throttled WebSocket broadcasts (250ms interval) to keep the browser responsive under heavy trading bursts.
* 📈 **Depth Control:** Auto-limits order book view to the top 20 bids and asks for optimal memory management.

---

## 🛠️ Tech Stack

### **Backend**
* **Language:** Java 17+
* **Framework:** Spring Boot 3
* **Concurrency Engine:** LMAX Disruptor
* **Message Broker:** Apache Kafka
* **Real-Time Protocol:** WebSockets / STOMP

### **Frontend**
* **Framework:** React + Vite
* **Protocol:** SockJS / STOMP Client

### **Infrastructure**
* **Containerization:** Docker
* **Build Tool:** Apache Maven

---

## 🏁 Run Commands

### 1️⃣ Start Apache Kafka (Docker)
```bash
docker run -p 9092:9092 apache/kafka:3.7.0
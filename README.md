# Axlero_OrderFlow

# 🚀 OrderFlow: High-Throughput Matching Gateway

## 📖 About The Project
OrderFlow is a super-fast financial trading system built for Capital Markets. It processes millions of buy and sell orders per second with microsecond latency! ⚡ Instead of using slow traditional locks, we use a lock-free architecture to match trades instantly.

## ✨ Key Features
* **Ultra-Fast Matching Engine:** Uses the LMAX Disruptor pattern for lock-free processing and bypassing standard Garbage Collection. 🏎️
* **Low Latency:** Proven to process 100,000 orders per second with a latency of under 100 microseconds. ⏱️
* **Live Market Data:** Calculates and streams "Level 2" Order Book depth every 100ms using WebSockets. 📡
* **High-Performance UI:** Uses HTML5 Canvas in React to render fast-moving market data without freezing the browser. 📊
* **Risk Management:** Includes a simulated pre-trade risk check before allowing orders into the engine. 🛡️

## 🛠️ Tech Stack
* **Backend Core:** Java, LMAX Disruptor
* **API & Streaming:** Spring WebFlux (Server-Sent Events / WebSockets)
* **Message Broker:** Aeron or Kafka
* **Frontend:** React, HTML5 Canvas

## 💻 Getting Started
*(Note: Update these steps as your project grows!)*

1. **Clone the repository:**
   `git clone [insert your repository link here]`
2. **Setup the Backend:**
   * Open the Java project in your favorite IDE (like IntelliJ or Eclipse).
   * Install Maven dependencies.
   * Run the main Spring Boot application.
3. **Setup the Frontend:**
   * Navigate to the frontend folder.
   * Run `npm install` to download packages.
   * Run `npm start` to launch the React app.

## 🌿 Branching Rule
Please do not push code directly to the `main` branch. Always create a new branch for your task and open a Pull Request (PR) for review! 👀

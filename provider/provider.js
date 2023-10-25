const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use((_, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// "In memory" data store
// let dataStore = require("./data/orders.js");
const orderRepository = require("./OrderRepository.js");

server.get("/orders", (_, res) => {
  res.json(orderRepository.fetchAll());
});

server.get("/order/:id", (req, res) => {
  const order = orderRepository.getById(parseInt(req.params.id));
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

module.exports = {
  server,
};

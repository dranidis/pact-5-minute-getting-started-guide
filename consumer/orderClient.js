const request = require("superagent");
const { Order } = require("./order");

const hostname = "127.0.0.1"

const fetchOrders = () => {
  return request.get(`http://${hostname}:${process.env.API_PORT}/orders`).then(
    (res) => {
      return res.body.reduce((acc, o) => {
        acc.push(new Order(o.id, o.items));
        return acc;
      }, []);
    },
    (err) => {
      console.log(err)
      throw new Error(`Error from response: ${err.response.body}`);
    }
  );
};

const fetchOrder = (id) => {
  return request.get(`http://${hostname}:${process.env.API_PORT}/order/${id}`).then(
    (res) => {
      return new Order(res.body.id, res.body.items);
    },
    (err) => {
      throw new Error(`Error from /order${id} response`);
    }
  );
}

module.exports = {
  fetchOrders,
  fetchOrder,
};

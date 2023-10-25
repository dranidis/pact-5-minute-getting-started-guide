// Setting up our test framework
const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// We need Pact in order to use it in our test
const { provider } = require("../pact");
const { eachLike } = require("@pact-foundation/pact").MatchersV3;

// Importing our system under test (the orderClient) and our Order model
const { Order } = require("./order");
const { fetchOrders, fetchOrder } = require("./orderClient");

// This is where we start writing our test
describe("Pact with Order API", () => {
  describe("given there are orders", () => {
    const itemProperties = {
      name: "pizza",
      quantity: 2,
      value: 100,
    };

    const orderProperties = {
      id: 1,
      items: eachLike(itemProperties),
    };

    const orderNotFoundError = {
      error: "Order not found",
    }

    describe("when a /orders call to the API is made", () => {
      before(() => {
        provider
          .given("there are orders")
          .uponReceiving("a request for orders")
          .withRequest({
            method: "GET",
            path: "/orders",
          })
          .willRespondWith({
            body: eachLike(orderProperties),
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });

      it("will receive the list of current orders", () => {
        return provider.executeTest((mockserver) => {
          // The mock server is started on a randomly available port,
          // so we set the API mock service port so HTTP clients
          // can dynamically find the endpoint
          process.env.API_PORT = mockserver.port;
          return expect(fetchOrders()).to.eventually.have.deep.members([
            new Order(orderProperties.id, [itemProperties]),
          ]);
        });
      });
    });

    describe("when a /orders/1 call to the API is made", () => {
      before(() => {
        provider
          .given("there is an order with id 1")
          .uponReceiving("a request for order with id 1")
          .withRequest({
            method: "GET",
            path: "/order/1",
          })
          .willRespondWith({
            body: orderProperties,
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });

      it("will receive the order with id 1", () => {
        return provider.executeTest((mockserver) => {
          // The mock server is started on a randomly available port,
          // so we set the API mock service port so HTTP clients
          // can dynamically find the endpoint
          process.env.API_PORT = mockserver.port;
          return expect(fetchOrder(1)).to.eventually.deep.equal(
            new Order(orderProperties.id, [itemProperties]),
          );
        });
      });
    });

    describe("when a /orders/666 call to the API is made", () => {
      before(() => {
        provider
          .given("there is no order with id 666")
          .uponReceiving("a request for order with id 666")
          .withRequest({
            method: "GET",
            path: "/order/666",
          })
          .willRespondWith({
            body: {},
            status: 404,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });

      it('should handle 404 error', () => {
        const id = 666;
        return provider.executeTest(async (mockserver) => {
          // The mock server is started on a randomly available port,
          // so we set the API mock service port so HTTP clients
          // can dynamically find the endpoint
          process.env.API_PORT = mockserver.port;

          try {
            await fetchOrder(id);
            // The test should fail if fetchOrder does not throw an error
            expect.fail('fetchOrder did not throw an error');
          } catch (error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal(`Error from /order${id} response`);
          }
        });

      }
      );
    });
  });

});

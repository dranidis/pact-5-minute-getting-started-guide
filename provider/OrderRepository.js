class OrderRepository {
    constructor() {
        this.orders = [];
    }

    clearAll() {
        this.orders = [];
    }

    fetchAll() {
        return this.orders;
    }

    getById(id) {
        return this.orders.find((entity) => id == entity.id);
    }

    add(entity) {
        console.log("🎃 INSERTING", entity);
        this.orders.push(entity);
    }
}

const orderRepository = new OrderRepository();

module.exports = orderRepository;
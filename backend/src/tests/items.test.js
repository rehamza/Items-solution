const request = require("supertest");
const express = require("express");
const itemsRouter = require("../routes/items");

// Setup test app with just the items route
const app = express();
app.use(express.json());
app.use("/api/items", itemsRouter);

describe("GET /api/items", () => {
  it("should return paginated items with total", async () => {
    const res = await request(app).get("/api/items?page=1&limit=3");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.total).toBe("number");
    expect(res.body.items.length).toBeLessThanOrEqual(3);
  });

  it("should filter items by search query", async () => {
    const res = await request(app).get("/api/items?q=Item");
    expect(res.statusCode).toBe(200);
    expect(
      res.body.items.every((i) => i.name.toLowerCase().includes("item"))
    ).toBe(true);
  });

  it("should return a single item by ID", async () => {
    const pageRes = await request(app).get("/api/items?limit=1");
    const item = pageRes.body.items[0];

    const res = await request(app).get(`/api/items/${item.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(item.id);
  });

  it("should return 404 for missing item", async () => {
    const res = await request(app).get("/api/items/99999999");
    expect(res.statusCode).toBe(404);
  });

  it("should create a new item", async () => {
    const newItem = {
      name: "Test Item",
      category: "Test",
      price: 99.99,
    };

    const res = await request(app).post("/api/items").send(newItem);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(newItem.name);
    expect(res.body.category).toBe(newItem.category);
    expect(res.body.price).toBe(newItem.price);
    expect(res.body.id).toBeDefined();
  });
});

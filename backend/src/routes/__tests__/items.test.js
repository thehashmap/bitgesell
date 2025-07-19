const request = require("supertest");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const itemsRouter = require("../items");

// Mock the file system
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use("/api/items", itemsRouter);

// Error handler middleware for tests
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const mockItems = [
  { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
  {
    id: 2,
    name: "Noise Cancelling Headphones",
    category: "Electronics",
    price: 399,
  },
  { id: 3, name: "Ultra‑Wide Monitor", category: "Electronics", price: 999 },
];

describe("Items Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/items", () => {
    it("should return all items", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app).get("/api/items").expect(200);

      expect(response.body).toEqual(mockItems);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("items.json"),
        "utf8"
      );
    });

    it("should filter items by search query", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app)
        .get("/api/items?q=laptop")
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Laptop Pro");
    });

    it("should limit number of items returned", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app).get("/api/items?limit=2").expect(200);

      expect(response.body).toHaveLength(2);
    });

    it("should handle file read errors", async () => {
      fs.readFile.mockRejectedValue(new Error("File not found"));

      await request(app).get("/api/items").expect(500);
    });
  });

  describe("GET /api/items/:id", () => {
    it("should return a specific item", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const response = await request(app).get("/api/items/1").expect(200);

      expect(response.body).toEqual(mockItems[0]);
    });

    it("should return 404 for non-existent item", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      await request(app).get("/api/items/999").expect(404);
    });

    it("should handle invalid item ID", async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      await request(app).get("/api/items/invalid").expect(404);
    });
  });

  describe("POST /api/items", () => {
    it("should create a new item", async () => {
      const newItem = { name: "New Product", category: "Test", price: 100 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(response.body).toMatchObject(newItem);
      expect(response.body.id).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should validate required name field", async () => {
      const invalidItem = { category: "Test", price: 100 };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate name is not empty string", async () => {
      const invalidItem = { name: "   ", category: "Test", price: 100 };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate name is string type", async () => {
      const invalidItem = { name: 123, category: "Test", price: 100 };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate required category field", async () => {
      const invalidItem = { name: "Test Product", price: 100 };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate category is not empty string", async () => {
      const invalidItem = { name: "Test Product", category: "", price: 100 };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate required price field", async () => {
      const invalidItem = { name: "Test Product", category: "Test" };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate price is number type", async () => {
      const invalidItem = {
        name: "Test Product",
        category: "Test",
        price: "100",
      };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate price is non-negative", async () => {
      const invalidItem = {
        name: "Test Product",
        category: "Test",
        price: -10,
      };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate name length limit", async () => {
      const invalidItem = {
        name: "A".repeat(101),
        category: "Test",
        price: 100,
      };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate category length limit", async () => {
      const invalidItem = {
        name: "Test Product",
        category: "A".repeat(51),
        price: 100,
      };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should validate price upper limit", async () => {
      const invalidItem = {
        name: "Test Product",
        category: "Test",
        price: 1000001,
      };

      await request(app).post("/api/items").send(invalidItem).expect(400);
    });

    it("should trim whitespace from name and category", async () => {
      const newItem = {
        name: "  Test Product  ",
        category: "  Test  ",
        price: 100,
      };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe("Test Product");
      expect(response.body.category).toBe("Test");
    });

    it("should round price to 2 decimal places", async () => {
      const newItem = { name: "Test Product", category: "Test", price: 99.999 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(response.body.price).toBe(100);
    });

    it("should handle write errors", async () => {
      const newItem = { name: "New Product", category: "Test", price: 100 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockRejectedValue(new Error("Write failed"));

      await request(app).post("/api/items").send(newItem).expect(500);
    });

    it("should handle read errors when creating item", async () => {
      const newItem = { name: "New Product", category: "Test", price: 100 };
      fs.readFile.mockRejectedValue(new Error("Read failed"));

      await request(app).post("/api/items").send(newItem).expect(500);
    });
  });
});

const express = require('express');
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId;
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpr9k.mongodb.net/FedEX?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
  try {
    await client.connect();
    const database = client.db("FedEX");
    const foodItems = database.collection("foodItems");
    const orders = database.collection("orders");

    app.post("/add_new_item", async (req, res) => {
      const newItem = req.body;
      try {
        const savedItem = await foodItems.insertOne(newItem);
        res.status(200).json(savedItem);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/all_items", async (req, res) => {
      try {
        const allItems = await foodItems.find().toArray();
        res.status(200).json(allItems);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/product/:id", async (req, res) => {
      const productId = req.params.id;
      try {
        const product = await foodItems.findOne({
          _id: new ObjectId(productId),
        });
        res.status(200).json(product);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.post("/create_order/:id", async (req, res) => {
      const productId = req.params.id;
      const newItem = { productId, ...req.body };
      try {
        const savedItem = await orders.insertOne(newItem);
        res.status(200).json(savedItem);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/all_orders", async (req, res) => {
      try {
        const allItems = await orders.find().toArray();
        res.status(200).json(allItems);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.put("/updateStatus/:id", async (req, res) => {
      const orderId = req.params.id;
      try {
        const order = await orders.updateOne(
          { _id: orderId },
          { $set: { status: "Approved" } }
        );
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.delete("/delete_order/:id", async (req, res) => {
      const orderId = req.params.id;
      try {
        const order = await orders.deleteOne({ _id: orderId });
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir)
app.get('/', (req, res) => {
    res.send("Server is ready");
});

app.listen(port, () => {
    console.log("Hello server!");
});
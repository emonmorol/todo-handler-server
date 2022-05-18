const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@todo-handler.shloa.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const todoCollection = client.db("todoHandler").collection("todos");

    app.post("/todoList", async (req, res) => {
      const todoDoc = req.body;
      const result = await todoCollection.insertOne(todoDoc);
      res.send(result);
    });

    app.get("/todoList", async (req, res) => {
      const todos = await todoCollection.find({}).toArray();
      res.send(todos);
    });

    app.delete("/todoList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await todoCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/todoList/:id", async (req, res) => {
      const id = req.params.id;
      const complete = req.body.completed;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isComplete: complete,
        },
      };
      const result = await todoCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToDo handler is active");
});

app.listen(port, () => {
  console.log(`to do running from port ${port}`);
});

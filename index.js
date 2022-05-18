const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized Access" });
  }

  const token = authHeader?.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "Forbidden Access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

async function run() {
  try {
    await client.connect();
    const todoCollection = client.db("todoHandler").collection("todos");

    app.post("/todoList", verifyJWT, async (req, res) => {
      const todoDoc = req.body;
      const result = await todoCollection.insertOne(todoDoc);
      res.send(result);
    });

    app.get("/todoList/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const todos = await todoCollection.find(query).toArray();
      res.send(todos);
    });

    app.delete("/todoList/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await todoCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/todoList/:id", verifyJWT, async (req, res) => {
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

    app.post("/user/:email", async (req, res) => {
      const email = req.params.email;
      const token = jwt.sign({ email: email }, process.env.ACCESS_SECRET_TOKEN);
      res.send({ token });
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

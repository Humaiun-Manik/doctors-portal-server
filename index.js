const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmp8mff.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // await client.connect();

    const treatmentCollection = client.db("doctors_portal").collection("treatments");

    /*---------------------
        Treatment API 
    ----------------------*/
    app.get("/treatment", async (req, res) => {
      const query = {};
      const cursor = treatmentCollection.find(query);
      const treatments = await cursor.toArray();
      res.send(treatments);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Doctors Portal");
});

app.listen(port, () => {
  console.log(`Doctors app listening on port ${port}`);
});

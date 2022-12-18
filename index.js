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
    const bookingCollection = client.db("doctors_portal").collection("bookings");

    /*---------------------
        Treatment API 
    ----------------------*/
    // get all treatments
    app.get("/treatment", async (req, res) => {
      const query = {};
      const cursor = treatmentCollection.find(query);
      const treatments = await cursor.toArray();
      res.send(treatments);
    });

    app.get("/available", async (req, res) => {
      const date = req.query.date;
      const treatments = await treatmentCollection.find().toArray();
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();
      treatments.forEach((treatment) => {
        const treatmentBookings = bookings.filter((booking) => booking.treatment === treatment.name);
        const bookedSlots = treatmentBookings.map((treatmentBook) => treatmentBook.slot);
        const available = treatment.slots.filter((slot) => !bookedSlots.includes(slot));
        treatment.slots = available;
      });
      res.send(treatments);
    });

    /*---------------------
        Booking API 
    ----------------------*/
    app.get("/booking", async (req, res) => {
      const patientEmail = req.query.patient;
      const query = { patientEmail: patientEmail };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    // insert a booking
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const query = { treatment: booking.treatment, date: booking.date, patientEmail: booking.patientEmail };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists });
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({ success: true, result });
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

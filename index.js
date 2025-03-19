const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())
app.use(express.text());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3umb5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // collections
    const userCollection = client.db('bloodDonationDb').collection('users') //user collections
    const donorCollection = client.db('bloodDonationDb').collection('donations') // donor collections


// user related apis request
    app.post('/users', async(req,res) => {
      const user = req.body
      const newUser ={
        ...user,
        role: user.role || 'donor',
        status: 'active'
      }
      const result = await userCollection.insertOne(newUser)
      res.send(result)
    })

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.findOne(query)
      // console.log(result);
      res.send(result)
    })
    app.patch('/users/:id', async(req, res) => {
      const user = req.body
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc= {
        $set: {
          name: user.name,
          district: user.district,
          subDistrict: user.subDistrict,
          blood: user.blood,
          image: user.image,
          status: user.status,
          role: user.role

        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
    // donor related apis request
    app.get('/donations', async(req, res) => {
       // Extract donor email and limit from query parameters
      const donor = req.query?.donor; // Get the 'donor' parameter (email) from the query string
      const limit = req.query?.limit // Get the 'limit' parameter from the query string

      // If a limit is provided, parse it as an integer. Default to 3 if no limit is given
      const parsedLimit = limit ? parseInt(limit) : 0;

      // Build the query object based on the presence of a donor email
      const query = donor ? {email: donor } : {};

      // Query the database for donations using the constructed query
    // The query is sorted by the 'createdAt' field in descending order (latest donations first)
    // The limit ensures that no more than the specified number of donations are fetched
      const donations = await donorCollection
            .find(query)
            .sort({ createdAt: -1 }) // Latest first
            .limit(parsedLimit > 0 ? parsedLimit : 0) // Apply limit if >0
            .toArray();
      res.send(donations)
    })

    app.patch('/donations/:id', async(req, res) => {
      const id = req.params.id;
      const status = req.body;
      const filter = {_id: new ObjectId(id)};
      const updateDoc ={
        $set: {
          status: status,
          createdAt: new Date()
        }
      }
      const result = await donorCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.post('/donations', async(req,res) => {
      const donation = req.body;
      const donationInfo ={
        ...donation,
        status: 'pending'
      }
      const result = await donorCollection.insertOne(donationInfo)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
  res.send('blood donation port is running')
})
app.listen(port, () => {
  console.log(`blood donation is running on ${port}`);
})
const express = require('express')
const cors = require('cors')
// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()


const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://solosphere.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())
// app.use(cookieParser())




//mongodb connection


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uo3rphs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const roomsCollection = client.db("roomsDB").collection("rooms");
        const bookingsCollection = client.db("roomsDB").collection("bookings");
        const allRoomsCollection = client.db("roomsDB").collection("allRooms");



        //get all rooms from db
        app.get('/rooms', async (req, res) => {
            const cursor = roomsCollection.find();
            const result = await cursor.toArray();
            res.json(result);

        })

        //get single room information from db

        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query);
            res.json(result);

        })


        //post booking information to mongodb
        app.post('/bookings', async (req, res) => {
            const booking = req.body;

            const result = await bookingsCollection.insertOne(booking);
            res.send(result)


        })


        //get some bookings data from db
        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })

        //cancel a booking

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        })


        //update Booking information
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.findOne(query);
            res.send(result);
        })

        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedBooking = req.body;
            const booking = {
                $set: {
                    email: updatedBooking.email,
                    date: updatedBooking.date,
                    name: updatedBooking.name,
                    room_size: updatedBooking.room_size,
                    price: updatedBooking.price,
                    availability: updatedBooking.availability
                }
            }
            const result = await bookingsCollection.updateOne(query, booking, options);
            res.send(result);




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





app.get('/', (req, res) => {
    res.send('hotel server is running...')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://herritage-1b537.web.app',
        'https://herritage-1b537.firebaseapp.com',
        'https://glistening-twilight-b2f2a1.netlify.app/',

    ],
    credentials: true,
    optionSuccessStatus: 200,
}



//midleware

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());




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

// jwt verify middleware
// const logger = (req, res, next) => {
//     console.log('called', req.host, req.originalUrl);
//     next();
// }

// const verifyToken = (req, res, next) => {
//     const token = req.cookies?.token;
//     console.log('value of token middlewere', token)
//     //if not token
//     if (!token) {
//         return res.status(401).send({ message: 'unauthorized2' });
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         console.log('err', err)
//         //err
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized1' });
//         }
//         console.log('decoded', decoded)
//         req.user = decoded;
//         next()


//     })

// }


const cookieOption = {

    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const roomsCollection = client.db("roomsDB").collection("rooms");
        const bookingsCollection = client.db("roomsDB").collection("bookings");
        const reviewsCollection = client.db("roomsDB").collection("reviews");

        //Auth related Api

        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     // console.log(user)
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '48h' });
        //     res
        //         .cookie('token', token, cookieOption)

        //         .send({ success: true });
        // })







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
            // console.log('token here', req.cookies.token)
            console.log('valid token user', req.user);

            // if (req.query?.email !== req.user?.email) {
            //     return res.status(403).send({ message: 'forbidden access' });

            // }

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

        //insert a review to db
        app.post('/review', async (req, res) => {
            const review = req.body;

            const result = await reviewsCollection.insertOne(review);
            res.send(result)


        })

        //get reviews from db
        app.get('/review', async (req, res) => {
            const cursor = reviewsCollection.find();
            const result = await cursor.toArray();
            res.json(result);

        })










        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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
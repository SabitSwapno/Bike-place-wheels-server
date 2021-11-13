const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.izxnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("bikeProvider");
        const productCollection = database.collection("products");
        const ordersCollection = database.collection('orders');
        const feedbacksCollection = database.collection('feedbacks');
        const usersCollection = database.collection('users');

        // get products api 
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // get feedbacks api 
        app.get('/feedbacks', async (req, res) => {
            const cur = feedbacksCollection.find({});
            const feedback = await cur.toArray();
            res.send(feedback);
        })

        // get users api 
        app.get('/users', async (req, res) => {
            const curso = usersCollection.find({});
            const useri = await curso.toArray();
            res.send(useri);
        })

        // get my order api
        app.get('/orders', async (req, res) => {
            const curs = ordersCollection.find({});
            const orders = await curs.toArray();
            res.send(orders);
        })

        // get my order api
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email, }
            const curs = ordersCollection.find(query);
            const orders = await curs.toArray();
            res.send(orders);
        })

        // admin secure get 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // Get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        })

        // post feedbacks api 
        app.post('/feedbacks', async (req, res) => {
            const fback = req.body;
            const result = await feedbacksCollection.insertOne(fback);
            res.json(result);
        })

        // post api 
        app.post('/products', async (req, res) => {
            const pdt = req.body;
            console.log('hit the post api', pdt);
            const result = await productCollection.insertOne(pdt);
            console.log(result);
            res.json(result);
        })

        // add order's api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // add users api
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            console.log(result);
            res.json(result);
        })

        // delete orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // delete orders
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })

        // make addmin put
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Bike Providers')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})


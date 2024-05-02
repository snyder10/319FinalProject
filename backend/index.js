var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
const path = require("path")

app.use(cors());
app.use(bodyParser.json());
app.use("/images", express.static("./images"))

const port = "8081";
const host = "localhost";
const { MongoClient } = require("mongodb");

// MongoDB
const url = "mongodb://127.0.0.1:27017";
const dbName = "319FinalProject";
const client = new MongoClient(url);
const db = client.db(dbName);

app.get("/products", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = {};
    const results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    console.log(results);
    res.status(200);
    res.send(results);
});

app.get("/products/trending", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = {trending:true};
    const results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    console.log(results);
    res.status(200);
    res.send(results);
});

app.get("/products/:category", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = {category: req.params.category};
    if (req.query.sub && JSON.parse(req.query.sub).length !== 0){
        query["sub_categories"] = {$all: JSON.parse(req.query.sub)};
        console.log(query)
    }
    const results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    res.status(200);
    res.send(results);
});

app.post("/user", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to POST MongoDB");
        console.log(req.body)
        const user = {
            "username": req.body.username,
            "password": req.body.password,
            "address": req.body.address,
            "zip": Number(req.body.zip),
            "credit_card_num": Number(req.body.card),
            "email": req.body.email,
            "phone": req.body.phone,
            "employee": false
        }
        const results = await db
            .collection("users")
            .insertOne(user)
        res.status(200);
        res.send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

app.delete("/user", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to DELETE MongoDB");
        console.log(req.body)
        const user = {
            "username": req.body.username,
            "password": req.body.password,
        }
        const results = await db
            .collection("users")
            .deleteOne(user)
        if(results["deletedCount"] > 0){
            res.status(200);
            res.send(results);
        } else {
            res.status(401).send({ error: 'You do not have permissions to perform this action' });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

app.get("/user", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to GET MongoDB");
        console.log(req.body)
        const user = {
            "username": req.body.username,
            "password": req.body.password,
        }
        const results = await db
            .collection("users")
            .findOne(user)
        if(user){
            res.status(200);
            res.send(results);
        } else {
            res.status(401).send({ error: 'You do not have permissions to perform this action' });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

app.put("/purchase", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to PUT MongoDB");
        console.log(req.body)
        let products = Object.keys(req.body.products);
        let results = "";
        let values = Object.values(req.body.products);
        for (let product in products){
            const query = {name: products[product]};
            const updateData = {$inc: {inventory: -1 * Number(values[product])}}
            results += await db
                .collection("products")
                .updateOne(query, updateData, {});
        }

        res.status(200);
        res.send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

app.put("/inventory", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to PUT MongoDB");
        console.log(req.body)

        let userQuery = {username: req.body.username, password: req.body.password, employee:true};

        const status = await db
                .collection("users")
                .findOne(userQuery);

        if(!status){
            res.status(401).send({ error: 'You do not have permissions to perform this action' });
            return;
        }

        let products = Object.keys(req.body.products);
        let results = "";
        let values = Object.values(req.body.products);
        for (let product in products){
            const query = {name: products[product]};
            const updateData = {$set: {inventory: Number(values[product])}}
            console.log(query)
            console.log(updateData)
            results += await db
                .collection("products")
                .updateOne(query, updateData, {});
        }
        res.status(200);
        res.send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
});

app.listen(port, () => {
    console.log("App listening at http://%s:%s", host, port);
});

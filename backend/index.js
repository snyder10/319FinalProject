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
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB
const url = "mongodb://127.0.0.1:27017";
const dbName = "319FinalProject";
const client = new MongoClient(url);
const db = client.db(dbName);

app.get("/products", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    let query = {};
    if (req.query.names) {
        query["name"] = { $in: JSON.parse(req.query.names) }
        console.log(query)
    }
    const results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    if (req.query.sort) {
        sortElements(JSON.parse(req.query.sort), results)
    }
    res.status(200);
    res.send(results);
});

app.get("/products/trending", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = { trending: true };
    const results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    if (req.query.sort) {
        sortElements(JSON.parse(req.query.sort), results)
    }
    res.status(200);
    res.send(results);
});

app.get("/products/:category", async (req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = { category: req.params.category };
    console.log(req.query)
    if (req.query.sub && JSON.parse(req.query.sub).length !== 0) {
        query["sub_categories"] = { $all: JSON.parse(req.query.sub) };
    }
    let results = await db
        .collection("products")
        .find(query)
        .limit(100)
        .toArray();
    if (req.query.sort) {
        sortElements(JSON.parse(req.query.sort), results)
    }
    res.status(200);
    res.send(results);
});

app.put("/cart", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to PUT MongoDB");
        console.log(req.body)

        let query = { username: req.body.username, password: req.body.password };

        const user = await db
            .collection("users")
            .findOne(query);

        if (!user) {
            res.status(401).send({ error: "You do not have permissions to perform this action" });
            return;
        }

        let product = req.body.product;
        let add = req.body.add

        if (add) {
            user["cart"][product] = user["cart"][product] ? user["cart"][product] + 1 : 1
        } else if (user["cart"][product]) {
            if (user["cart"][product] == 1) {
                delete user["cart"][product];
            } else {
                user["cart"][product] -= 1;
            }
        }

        const updateData = { $set: { cart: user["cart"] } }
        console.log(updateData);
        console.log(user["cart"])
        const results = await db
            .collection("users")
            .updateOne(query, updateData, {});
        console.log(results)
        res.status(200);
        res.send(user["cart"]);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.post("/user", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to POST MongoDB");
        console.log(req.body)
        const userData = {
            "username": req.body.username,
            "password": req.body.password,
            "address": req.body.address,
            "zip": Number(req.body.zip),
            "credit_card_num": req.body.card,
            "email": req.body.email,
            "phone": req.body.phone,
            "city": req.body.city,
            "state": req.body.state,
            "employee": false,
            "cart": req.body.cart,
        }

        const original = await db
            .collection("users")
            .findOne({ email: req.body.email })

        console.log(original);

        if (original !== null) {
            console.log("test");
            res.status(409);
            res.send({ error: "Email is already registered" });
        } else {

            await db
                .collection("users")
                .insertOne(userData)

            let user = await db
                .collection("users")
                .findOne(userData)

            if (db) {
                user["credit_card_num"] = user["credit_card_num"].replace(/.(?=.{4,}$)/g, '*');
                user["password"] = "********"
                res.status(200);
                res.send(user);
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
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
        if (results["deletedCount"] > 0) {
            res.status(200);
            res.send(results);
        } else {
            res.status(401).send({ error: "You do not have permissions to perform this action" });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.post("/user/login", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to POST MongoDB");

        const { email, password } = req.body;
        console.log(req.body)

        if (!email || !password) {
            return res.status(400).send({ error: "Username and password are required" });
        }

        const user = await db.collection("users").findOne({ email, password });

        if (user) {
            user["credit_card_num"] = user["credit_card_num"].replace(/.(?=.{4,}$)/g, '*');
            user["password"] = "********"
            res.status(200).send(user);
        } else {
            res.status(401).send({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.put("/purchase", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to PUT MongoDB");
        console.log(req.body.card)
        let results = "";
        let card;
        let products;
        let values;

        if (req.body.email && req.body.password) {
            const user = await db.collection("users").findOne({ email: req.body.email, password: req.body.password });

            if (user === null) {
                res.status(404);
                res.send({ error: "User not found" });
                return;
            }

            products = Object.keys(user["cart"])
            values = Object.values(user["cart"])
            card = user["credit_card_num"]
        } else if (req.body.card) {
            card = req.body.card
            products = Object.keys(req.body.products);
            console.log(products);
            values = Object.values(req.body.products);
            console.log(values);
        } else {
            console.log("here");
            res.status(400).send({ error: "Too little information in the body" });
            return;
        }


        for (let product in products) {
            let query = { name: products[product] }
            const backendProduct = await db
                .collection("products")
                .findOne(query)
            if (backendProduct.inventory < values[product]) {
                res.status(409).send({ error: "Not enough products available" });
                return;
            }

        }

        for (let product in products) {
            const query = { name: products[product] };
            const updateData = { $inc: { inventory: -1 * Number(values[product]) } }
            results += await db
                .collection("products")
                .updateOne(query, updateData, {});
        }

        console.log(`successfully charged purchase to ${card}`)

        if (req.body.email && req.body.password) {
            await db
                .collection("users")
                .updateOne({ email: req.body.email, password: req.body.password }, { $set: { "cart": {} } })
        }
        res.status(200);
        res.send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.put("/inventory", async (req, res) => {
    try {
        await client.connect();
        console.log("Node connected successfully to PUT MongoDB");
        console.log(req.body)

        let userQuery = { email: req.body.email, password: req.body.password, employee: true };

        const status = await db
            .collection("users")
            .findOne(userQuery);

        if (!status) {
            res.status(401).send({ error: "You do not have permissions to perform this action" });
            return;
        }

        let product = req.body.product;
        let inventory = req.body.inventory

        const query = { _id: new ObjectId(product) };
        const updateData = { $set: { inventory: Number(inventory) } }
        console.log(query)
        console.log(updateData)
        const results = await db
            .collection("products")
            .updateOne(query, updateData, {});
        res.status(200);
        res.send(results);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.listen(port, () => {
    console.log("App listening at http://%s:%s", host, port);
});

function sortElements(sortPriority, itemsArray) {

    itemsArray.sort((a, b) => {

        for (let i = 0; i < sortPriority.length; i++) {
            let prop = sortPriority[i]["priority"];
            let first;
            let second;
            if (sortPriority[i]["direction"] === "ascending") {
                first = a;
                second = b;
            } else {
                first = b;
                second = a;
            }
            if (first[prop] !== second[prop]) {
                if (prop === "price" || prop === "inventory") {
                    console.log(first)
                    return first[prop] - second[prop];
                } else {
                    return first[prop].localeCompare(second[prop], undefined, { sensitivity: "base" });
                }
            }
        }
        return 0;
    });
}
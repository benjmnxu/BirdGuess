const { MongoClient } = require("mongodb");
const config = require("./config");

const client = new MongoClient(config.mongo_uri);
client.connect();
const coll = client.db("cluster0").collection("profiles");

module.exports = coll;

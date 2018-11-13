const port = parseInt(process.argv[2],10) || 4242;
const path = require('path')
const dbPath = path.resolve(__dirname, 'db_Step01')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(dbPath);


db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS post (key TEXT, value INTEGER)");
    db.run("INSERT INTO post (key, value) VALUES (?, ?)", "numberPost", 0);
});


const express = require('express');
const restapi = express();

restapi.get('/data', function(req, res){
    db.get("SELECT value FROM post", function(err, row){
        res.json({ "numberOfPost" : row.value });
    });
});

restapi.post('/data', function(req, res){
    db.run("UPDATE post SET value = value + 1 WHERE key = ?", "numberPost", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
    });
});


restapi.listen(port);

console.log(`Submit GET or POST to http://localhost:${port}/data`);

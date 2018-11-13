const port = parseInt(process.argv[2],10) || 4242;
const {existsSync} = require('fs');
const path = require('path')
const dbPath = path.resolve(__dirname, 'db_Step02')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(dbPath);



db.serialize(function() {
  if (!existsSync(dbPath)) {

    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,nickname TEXT, email TEXT, password TEXT)");
    const dbPrepare = db.prepare("INSERT INTO users (nickname,email,password) VALUES (?,?,?)");
    dbPrepare.run("Andrea", "andrea@node.js","nodeJs");
    dbPrepare.run("Chris", "Chris@node.js","ChrisJs");
    dbPrepare.run("Java", "Java@node.js","JavaJs");
  }
});


const express = require('express');
const restapi = express();

restapi.get('/users', function(req, res){
    db.all("SELECT * FROM users", function(err, row){
      for (let item  in row) {

        res.write(` { Id :${row[item].id}, Nickname : ${row[item].nickname}, Email : ${row[item].email}, Password : ${row[item].password} } \n`);
        }
        res.end();
    });

});

restapi.get(`/users/:id`, function(req, res){
    db.get(`SELECT nickname,email FROM users WHERE id = ${req.params.id}`, function(err, row){
        res.json({ "Nickname" : row.nickname,
                   "Email" : row.email});
    });
});
//
// restapi.get('/users/:nickname', function(req, res){
//   console.log(req.params.nickname);
//     db.get(`SELECT id,nickname,email FROM users WHERE nickname = ${req.params.nickname}`, function(err, row){
//         res.json({ "Id" : row.id,
//                    "Nickname" : row.nickname,
//                    "Email" : row.email});
//     });
// });
//
// restapi.get('/users/:email', function(req, res){
//     db.get(`SELECT id,nickname,mail FROM users WHERE email = ${req.params.email}`, function(err, row){
//       res.json({ "Id" : row.id,
//                  "Nickname" : row.nickname,
//                  "Email" : row.email});
//     });
// });
//
// restapi.get('/users/:password', function(req, res){
//     db.get(`SELECT id,nickname,email FROM users WHERE password = ${req.params.password}`, function(err, row){
//       res.json({ "Id" : row.id,
//                  "Nickname" : row.nickname,
//                  "Email" : row.email});
//     });
// });


restapi.post('/users', function(req, res){
    db.run("UPDATE users SET id = id - 1 ", function(err, row){
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

console.log(`Submit GET or POST to http://localhost:${port}/<path>`);

const port = parseInt(process.argv[2],10) || 4242;
const {existsSync} = require('fs');
const path = require('path')
const dbPath = path.resolve(__dirname, 'db_Step03')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(dbPath);
var dbPrepareUser;
var dbPrepareLink;



db.serialize(function() {
   if (!existsSync(dbPath)) {
    db.run(`CREATE TABLE IF NOT EXISTS users(
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      nickname VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL)`);
    dbPrepareUser = db.prepare("INSERT INTO users (nickname,email,password) VALUES (?,?,?)");
    dbPrepareUser.run("Andrea", "andrea@node.js","NodeJs");
    db.run(`CREATE TABLE IF NOT EXISTS link(
           id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
           tags VARCHAR(100),
           url VARCHAR(100) ,
           user_link INTEGER,
           FOREIGN KEY(user_link) REFERENCES users(id))`);
   dbPrepareLink = db.prepare("INSERT INTO link (tags,url,user_link) VALUES (?,?,?)");
   dbPrepareLink.run('TEST','test.fr',1);
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
      if (!row) {
        res.write(`This users id don't exists`)
        res.end();

      }else {
        res.json({ "Nickname" : row.nickname,
                   "Email" : row.email});
      }
    });
});

restapi.post('/users', function(req, res){

  dbPrepareUser.run(`${req.query.nickname}`,`${req.query.email}`,`${req.query.password}`)
  res.write(`The new user ${req.query.nickname} is succefully register in the database`)
  res.end();

});

restapi.post('/users/update:id', function(req, res){
  db.run(`UPDATE users SET nickname = ${req.query.nickname} WHERE id = ${req.params.id}`);
  console.log(req.params.id);
      res.write(`The nickname is rename to ${req.query.nickname}`);
      res.end();
});

restapi.post('/users/delete:id', function(req, res){
  db.run(`DELETE FROM users WHERE id = ${req.params.id}`);
      res.write(`The user is removed`);
      res.end();
});

restapi.listen(port);

console.log(`Submit GET or POST to http://localhost:${port}/<path>`);

var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());


var connection = mysql.createConnection({
    host: 'mydbinstance.cuyf19dhklbo.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'password',
    database: 'mydb'
});

connection.connect();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Form.html')
});

app.get('/teams', function (req, res) {
    connection.query('SELECT teamName FROM Team', function (error, results, fields) {
        if (error) {
            res.send(error);
        }
        res.send(results);
    });
});

app.post('/login', function (req, res) {
    connection.query('SELECT username, password, team FROM Employee JOIN Poll ON employee = username WHERE username = "' + req.body.username +
        '" AND password = "' + req.body.password + '" AND team = "' + req.body.team + '"', function (error, results, fields) {
        if (error) {
            res.send(error);
        }
        res.send(results);
    })
});

app.post('/questions', function (req, res) {
    var month = (new Date()).getMonth() + 1;
    var year = (new Date()).getFullYear();
    connection.query('SELECT q.idQuestion, q.question FROM TeamQuestions t JOIN Question q ON t.question = q.idQuestion WHERE t.team = "' + req.body.team + '"',
        function (error, results, fields) {
            if (error) {
                res.send(error);
            }
            res.send(results);
        });
});

app.post('/submit', function (req, res) {
    var team = req.body.team;
    var username = req.body.username;
    var date = (new Date()).toISOString().substring(0, 10);
    delete req.body.team;
    delete req.body.username;
    for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            var answer = req.body[key];
            connection.query('UPDATE `TeamQuestions` SET `' + answer + '` = `' + answer + '` + ' + 1 + ' WHERE `team` = "' + team + '" AND `question` = "' + key + '"',
                function (error, results, fields) {
                    if (error) {
                        res.send(error);
                    }
                });
        }
    }
    connection.query('UPDATE `Poll` SET `date` = "' + date + '" WHERE `team` = "' + team + '" AND `employee` = "' + username + '"',
        function (error, res, fields) {
            if (error) {
                res.send(error);
            }
        });
});

app.listen(3000);
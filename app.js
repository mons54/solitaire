var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app);

app.use(express.static(__dirname));

app.get('*', function (req, res) {
	fs.readFile(__dirname + '/index.html', 'utf8', function (err, html) {
        res.send(html);
    });
});

server.listen(8080);
console.log("SERVER GAME v1.0");
var global = require('./server/core/global.js');
var character = require('./server/objects/character.js');
var npc = require('./server/objects/npc.js');
var WebSocketServer = require('ws').Server;
var Server = new WebSocketServer({port: 9998});
var express = require('express');
var app = express();

//Запускаем HTTP сервер
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/client'));
app.listen(80);

global.world['456rwty652456rfyj67u'] = new npc('456rwty652456rfyj67u');

Server.on("connection", function(server, req) {
	var sign = req.headers['sec-websocket-key'];
	global.signs[sign] = sign;
	global.world[sign] = new character(server);
	console.log("Подключился клиент: " + sign);
	server.on("message", function(message) {
		var sign = req.headers['sec-websocket-key'];
		try {
			var json = JSON.parse(message);
			switch (json.code) {
				case "AUTH": if(global.world[global.signs[sign]].auth) global.world[global.signs[sign]].auth(sign, json); break;
				case "SELECT": if (global.world[json.id].select) global.world[json.id].select(sign, json); break;
				case "UPDATE": if (global.world[global.signs[sign]].update) global.world[global.signs[sign]].update(sign, json); break;
				default: console.log(json);
			}
		} catch(e) {
			console.log("Ошибка в try/catche" + e);
		}
	});
	server.on("close", function close() {
		var sign = req.headers['sec-websocket-key'];
		try {
			global.world[global.signs[sign]].disconnect(sign);
		} catch(e) {
			console.log("Ошибка в try/catche" + e);
		}
	});
});

setInterval(function() {
	for (var i in global.world)
		if (global.world[i].timer)
			global.world[i].timer();
}, 1000);


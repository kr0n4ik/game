var global = require('../core/global.js');

function character(client) {
	this.type = "character";
	this.client = client;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.o = 0;
	this.model = "WarrionCrusader";
}

character.prototype.auth = function(sign) {
	this.id = global.signs[sign];
	this.client.send(JSON.stringify({code: "AUTH", id: this.id}));
	for (var i in global.world) {
		this.client.send(JSON.stringify({
			code: "UPDATE", 
			id: i, 
			type: global.world[i].type, 
			model: global.world[i].model, 
			x: global.world[i].x,
			y: global.world[i].y,
			z: global.world[i].z,
			o: global.world[i].o
		}));
		if (global.world[i].type == "character" && i != this.id)
			global.world[i].client.send(JSON.stringify({
				code: "UPDATE", 
				id: this.id, 
				type: this.type, 
				model: "WarrionCrusader",
				x: this.x,
				y: this.y,
				z: this.z,
				o: this.o
			}));
	}
}

character.prototype.disconnect = function(sign) {
	var id = global.signs[sign];
	for (var i in global.world)
		if (global.world[i].type == "character" && i != id)
			global.world[i].client.send(JSON.stringify({code: "DISCONNECT", id: id}));
	delete(global.signs[sign]);
	delete(global.world[id]);
	console.log("Отключился клиент: " + sign);
}

character.prototype.update = function(sign, json) {
	if (json.x) {
		this.x = parseFloat(json.x).toFixed(4)* 1.0;
		json.x = this.x; 
	}
	if (json.y) {
		this.y = parseFloat(json.y).toFixed(4)* 1.0;
		json.y = this.y; 
	}
	if (json.z) {
		this.z = parseFloat(json.z).toFixed(4) * 1.0;
		json.z = this.z; 
	}
	if (json.o) {
		this.o = parseFloat(json.o).toFixed(2)* 1.0;
		json.o = this.o; 
	}
	json['id'] = this.id;
	for (var i in global.world)
		if (global.world[i].type == "character")
			global.world[i].client.send(JSON.stringify(json));
}

module.exports = character;
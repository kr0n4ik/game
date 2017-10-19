/*
Модуль персонажа
*/
var global = require('../core/global.js');

function npc(id) {
	this.model = "KerriHicks";
	this.type = "npc";
	this.x = 200;
	this.y = 0;
	this.z = 200;
	this.o = 0;
	this.id = id;
	
}

npc.prototype.select = function(sign, json) {
	var n = this.getRandonInt(0, 4);
	var texts = ["Что тебе нужно?", "Меня зовут Мария. А тебя как?", "Я тут уже стою кучу времени","Хватит в меня тыкать"];
	global.world[global.signs[sign]].client.send(JSON.stringify({ code: "UPDATE", id:this.id, talk: texts[n]}));
}

npc.prototype.getRandonInt = function(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}



module.exports = npc;
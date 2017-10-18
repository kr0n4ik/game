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

npc.prototype.getRandonInt = function(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

module.exports = npc;
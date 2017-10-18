var socket = new WebSocket("ws://localhost:9998/");
var scene = new THREE.Scene();
var clock = new THREE.Clock();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 30, width / height, 0.1, 20000 );
var models = [];
var world = [];
var me;
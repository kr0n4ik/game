var container = document.createElement( 'div' );
document.body.appendChild( container );
camera.position.set( 0, 150, 1000 );
scene.add( camera );

var renderer = new THREE.WebGLRenderer( );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width , height );
container.appendChild(renderer.domElement );
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			
var light = new THREE.DirectionalLight( 0xffffff, 2.25 );
light.position.set( 200, 450, 500 );
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 100;
light.shadow.camera.far = 1200;
light.shadow.camera.left = -1000;
light.shadow.camera.right = 1000;
light.shadow.camera.top = 350;
light.shadow.camera.bottom = -350;
scene.add( light );

var stats = new Stats();
container.appendChild( stats.dom );

//var cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
//cameraControls.target.set( 0, 10, 0 );
//cameraControls.update();

scene.add( new THREE.AmbientLight( 0xffffff ) );
scene.add( new THREE.CameraHelper( camera ) );
scene.add(new THREE.AxisHelper(200));
var geometry2 = new THREE.PlaneGeometry(6000, 6000, 199, 199);
var material2 = new THREE.MeshPhongMaterial({color: 0xdddddd, wireframe: true});
var plane2 = new THREE.Mesh(geometry2, material2);
plane2.rotation.x = - Math.PI / 2;
scene.add(plane2);

animate();

function animate() {
	var delta = clock.getDelta();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	stats.update();
	for (var i in world)
		if (world[i].animate)
			world[i].animate(delta);
}

socket.onmessage = function (evt) { 
	var json = JSON.parse(evt.data);
	switch (json.code) {
		case "AUTH": auth(json); break;
		case "UPDATE": update(json); break;
		default: console.log(json);
	}
};

function auth(json) {
	me = json.id;
}

function update(json) {
	if (!world[json.id]) {
		if (!models[json.model]) {
			THREE.MDLLoader('assets/models/' + json.model + '/' + json.model + '.mdl', function(geometries, anims) {
				geometries.forEach(function(geo) {
					geo.extra.TexturePath = geo.extra.TexturePath ? 'assets/models/' + json.model + '/' + geo.extra.TexturePath.split('\\').pop().replace(/\.\w+$/g, '.png') : ''
				});
				models[json.model] = geometries;
				world[json.id] = new character(models[json.model], json);
				scene.add(world[json.id].root);
				console.log("load obj " + json.model);
			});
		} else {
			world[json.id] = new character(models[json.model], json);
			scene.add(world[json.id].root);
			console.log("new obj " + json.model);
		}
	} else {
		world[json.id].update(json);
	}
}

setInterval(function() {
	for (var i in world)
		if (world[i].timer)
			world[i].timer();
}, 1000);


var keyCode;
$( document ).ready(function() {
	//$("#login").click(function(){
		socket.send('{"code": "AUTH", "username": "tester", "password": "123456"}');
	//});
});
document.addEventListener( 'mousedown', function(event) { 
	function getSelectObject(world, raycaster){
		for(var i in world) {
			for(var j in world[i].root.children) {
				var intersects = raycaster.intersectObject( world[i].root.children[j] );
				if ( intersects.length > 0 ){
					return world[i];
				}
			}
		}
	}
	var vector = new THREE.Vector3(( event.clientX / width ) * 2 - 1, -( event.clientY / height ) * 2 + 1, 0.5);
	vector = vector.unproject(camera);
	var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
	var object = getSelectObject(world, raycaster);
	if (object) {
		console.log(object);
		socket.send('{"code": "SELECT", "id": "' + object.id +  '"}');
	}
});

window.addEventListener( "keydown",
	function(e) {
		if (e.keyCode != keyCode) {
			switch( e.keyCode ) {
				case 87: socket.send('{"code": "UPDATE", "move":"forward", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
				case 83: socket.send('{"code": "UPDATE", "move":"back", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
				case 65: socket.send('{"code": "UPDATE", "turn":"left", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
				case 68: socket.send('{"code": "UPDATE", "turn":"right", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
				case 32: socket.send('{"code": "UPDATE", "jump":"up", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
			}
			keyCode = e.keyCode;
		}
	}
);
window.addEventListener( "keyup", 
	function(e) {
		keyCode = 0;
		console.log("key " + e.keyCode);
		switch( e.keyCode ) {
			case 65: socket.send('{"code": "UPDATE", "turn":"stop", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
			case 68: socket.send('{"code": "UPDATE", "turn":"stop", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
			case 87: socket.send('{"code": "UPDATE", "move":"stop", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
			case 83: socket.send('{"code": "UPDATE", "move":"stop", "x":"' + world[me].root.position.x + '", "z":"' + world[me].root.position.z + '", "y":"' + world[me].root.position.y + '", "o":"' + world[me].root.rotation.y + '"}'); break;
		}
	}
);
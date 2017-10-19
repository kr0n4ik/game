function character(geometries, json) {
	this.sprite = null;
	this.mixes = [];
	this.clips = [];
	this.TurnRate = 5;
	this.WalkSpeed = 150;
	this.BackSpeed = 100;
	this.anim = "Stand";
	this.root = new THREE.Object3D();
	for(var i in geometries) {
		var mat = geometries[i].MaterialCache;
		if (!mat) {
			if (geometries[i].extra.TexturePath) {
				var texture = THREE.ImageUtils.loadTexture(geometries[i].extra.TexturePath, undefined);
				texture.flipY = false
				mat = new THREE.MeshPhongMaterial({ map:texture, alphaTest:0.5, side:geometries[i].extra.TwoSided ? THREE.DoubleSide : THREE.FrontSide })
			} else {
				mat = new THREE.MeshBasicMaterial()
			}
			mat.skinning = true;
			geometries[i].MaterialCache = mat;
		}
		mesh = new THREE.SkinnedMesh(geometries[i], mat);
		mesh.rotation.z = -Math.PI / 2;
		mesh.rotation.x = -Math.PI / 2;
		this.root.add(mesh);
		//Тестовая анимация
		for (j = 0; anim = geometries[i].animations[j]; ++j) {
			if (!this.mixes[anim.name]) {
				this.mixes[anim.name] = [];
				console.log(anim.name);
			}
			if (!this.clips[anim.name])
				this.clips[anim.name] = [];
				
			mix = new THREE.AnimationMixer(mesh);
			clip = mix.clipAction(mesh.geometry.animations[j]);
			clip.play();
			this.mixes[anim.name].push(mix);
			this.clips[anim.name].push(clip);
		}
	}
	this.update(json);
}

character.prototype.update = function(json) {
	if (json.id)
		this.id = json.id;
	if (json.type)
		this.type = json.type;
	if (json.x)
		this.root.position.x = json.x;
	if (json.y)
		this.root.position.y = json.y;
	if (json.z)
		this.root.position.z = json.z;
	if (json.o)
		this.root.rotation.y = json.o;
	if (json.turn)
		this.turn = json.turn;
	if (json.move)
		this.move = json.move;
	if (json.talk)
		this.talk(json.talk);
}

character.prototype.timer = function() {
	
}

character.prototype.animate = function(delta) {
	var center = this.root.position.clone();
	if (this.turn == "left") {
		this.root.rotation.y += this.TurnRate * delta;
	} else if (this.turn == "right") {
		this.root.rotation.y -= this.TurnRate * delta;
	}
	if (this.move == "forward") {
		center.x += Math.sin(this.root.rotation.y) * this.WalkSpeed * delta;
		center.z += Math.cos(this.root.rotation.y) * this.WalkSpeed * delta;
	} else if (this.move == "back") {
		center.x -= Math.sin(this.root.rotation.y) * this.BackSpeed * delta;
		center.z -= Math.cos(this.root.rotation.y) * this.BackSpeed * delta;
	}
	this.root.position.copy( center );
	if (this.sprite) {
		this.sprite.position.x = this.root.position.x;
		this.sprite.position.z = this.root.position.z;
		this.sprite.position.y = 120;
	}
	camera.position.x = this.root.position.x - Math.sin(this.root.rotation.y) * 500;
	camera.position.z = this.root.position.z - Math.cos(this.root.rotation.y) * 500;
	camera.position.y = 100;
	camera.rotation.y = this.root.rotation.y + Math.PI;
	this.anim = (this.move == "forward" || this.move == "back") ? "Walk" : "Stand";
	
	if (this.anim) 
		for(var i in this.mixes[this.anim]) 
			this.mixes[this.anim][i].update(delta);
		
}

character.prototype.talk = function(message) {
	if (this.sprite) {
		scene.remove(this.sprite);
	}
	console.log(message);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font="22px Arial";
	context.fillStyle = "rgba(200, 255, 255, 1.0)";
	context.fillText( message, 0, 100);
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;
	var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false} );
	this.sprite = new THREE.Sprite( spriteMaterial );
	this.sprite.scale.set(80,50,1.0);
	scene.add(this.sprite);
}
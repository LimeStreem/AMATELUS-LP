/*!
 * jThree.Stereo.js JavaScript Library v1.1
 * http://www.jthree.com/
 *
 * Requires jThree v2.0
 * Includes THREE.StereoEffect.js | Copyright (c) 2010-2014 three.js authors
 *
 * The MIT License
 *
 * Copyright (c) 2014 Matsuda Mitsuhide
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Date: 2016-02-29
 */
 
/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 */

THREE.StereoEffect = function ( renderer ) {

	// API

	this.separation = 3;
	this.isPortrait = true;

	// internals

	var _width, _height;

	var _position = new THREE.Vector3();
	var _quaternion = new THREE.Quaternion();
	var _scale = new THREE.Vector3();

	var _cameraL = new THREE.PerspectiveCamera();
	var _cameraR = new THREE.PerspectiveCamera();
	_cameraL.useQuaternion = _cameraR.useQuaternion = true;

	// initialization

	this.getOrientation = function() {

	    switch (window.screen.orientation || window.screen.mozOrientation) {

	      case 'landscape-primary':

	        return 90;

	      case 'landscape-secondary':

	        return -90;

	      case 'portrait-secondary':

	        return 180;

	      case 'portrait-primary':

	        return 0;

	    }

	    // this returns 90 if width is greater then height 

	    // and window orientation is undefined OR 0

	    // if (!window.orientation && window.innerWidth > window.innerHeight)

	    //   return 90;

	    return window.orientation || 0;

	 };

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;
		this.isPortrait = this.getOrientation() % 180 === 0;

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();
	
		camera.matrixWorld.decompose( _position, _quaternion, _scale );

		// left

		_cameraL.fov = camera.fov;
		_cameraL.aspect = ( this.isPortrait ? 2 : 0.5 ) * camera.aspect;
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;
		_cameraL.updateProjectionMatrix();

		_cameraL.position.copy( _position );
		_cameraL.quaternion.copy( _quaternion );
		_cameraL[ "translate" + ( this.isPortrait ? "Y" : "X" ) ]( - this.separation );
		_cameraL.updateMatrixWorld();

		// right

		_cameraR.near = camera.near;
		_cameraR.far = camera.far;
		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.position.copy( _position );
		_cameraR.quaternion.copy( _quaternion );
		_cameraR[ "translate" + ( this.isPortrait ? "Y" : "X" ) ]( this.separation );
		_cameraR.updateMatrixWorld();

		//

		renderer.setViewport( 0, 0, _width * 2, _height );
		renderer.clear();

		if ( this.isPortrait ) {
			camera.position.copy( _cameraL.position );
			camera.updateMatrixWorld();
			renderer.setViewport( 0, 0, _width * 2, _height / 2 );
			renderer.render( scene, _cameraL );

			camera.position.copy( _cameraR.position );
			camera.updateMatrixWorld();
			renderer.setViewport( 0, _height / 2, _width * 2, _height / 2 );
			renderer.render( scene, _cameraR );
		} else {
			camera.position.copy( _cameraL.position );
			camera.updateMatrixWorld();
			renderer.setViewport( 0, 0, _width, _height );
			renderer.render( scene, _cameraL );

			camera.position.copy( _cameraR.position );
			camera.updateMatrixWorld();
			renderer.setViewport( _width, 0, _width, _height );
			renderer.render( scene, _cameraR );
		}

		camera.position.copy( _position );
		camera.updateMatrixWorld();


	};

};

!function() {

var Stereo = function( selector ) {

	this.rdrObj = jThree( selector || "rdr:first" ).resize( this.setSize.bind( this ) );
	this.rdr = this.rdrObj.three( 0 );
	this.canvas = this.rdr.domElement;
	this.effect = new THREE.StereoEffect( this.rdr );

	var that = this;
	this.update = function( delta, elapsed ) {

		var j, elem, rdr = that.rdr;

		for ( ( j = rdr.__updateFn.length ) && ( elem = rdr.userData.dom ); j; ) {
			rdr.__updateFn[ --j ].call( elem, delta, elapsed );
		}

		that.effect.render( that.scene, that.camera );

	};

};

Stereo.prototype = {
	constructor: THREE.StereoEffect,
	setSize: function() {
		this.effect.setSize( this.canvas.width, this.canvas.height );
	},
	start: function() {

		if ( this.playing ) return;
		this.playing = true;
		this.rdr.autoClear = false;
		this.rdrObj.attr( "rendering", false );
		this.camera = this.rdr.__camera;
		this.scene = this.camera.userData.scene;
		this.setSize();
		jThree.update( this.update );
		return this;

	},
	stop: function() {

		if ( !this.playing ) return;
		this.playing = false;
		this.rdr.autoClear = true;
		jThree.update( this.update, false );
		this.rdr.setViewport( 0, 0, this.canvas.width, this.canvas.height );
		this.rdrObj.attr( "rendering", true );
		return this;

	},
	toggle: function() {
		this[ this.playing ? "stop" : "start" ]();
		return this;
	}
};

jThree.Stereo = function( selector ) {
	return new Stereo( selector ).start();
};

}();
/**
 * An actual useful fork of dunxrion/console.image
 * Created by Adrian Cooney
 * http://dunxrion.github.io
 */

(function(console) {
	"use strict";

	/**
	 * Since the console.log doesn't respond to the `display` style,
	 * setting a width and height has no effect. In fact, the only styles
	 * I've found it responds to is font-size, background-image and color.
	 * To combat the image repeating, we have to get a create a font bounding
	 * box so to speak with the unicode box characters. EDIT: See Readme.md
	 * 	
	 * @param  {int} width  The height of the box
	 * @param  {int} height The width of the box
	 * @return {object}     {string, css}
	 */
	function getBox(width, height) {
		return {
			string: "+",
			style: "font-size: 1px; padding: " + Math.floor(height/2) + "px " + Math.floor(width/2) + "px; line-height: " + height + "px;"
		}
	}

	/**
	 * Profile class for a canvas
	 * @param {CanvasRenderingContext2D} ctx    The context to profile
	 * @param {HTMLCanvasElement} canvas The canvas element
	 */
	var Profile = function(ctx, canvas) {
		this.ctx = ctx;
		this.canvas = canvas;
		this.stack = [];
		this.startTime = (new Date()).getTime();
		this.collectFPS = true;
		this.frames = 0;
		
		//Add the initial state
		this.addState(this.returnState(ctx));

		//Add a sort of man in the middle/proxy for all the
		//context render functions and tell the profiler
		//when a function call happens. We send along the 
		//function name, the arguments, and the context state
		var that = this;
		for(var fn in ctx) { //Move the native data to a namespace
			if(typeof ctx[fn] == "function") {
				ctx["_CF_" + fn] = ctx[fn];
				(function(fn) { //Create the closure
					ctx[fn] = function() {
						that.addState(that.returnState(ctx));
						that.addFunctionCall(fn, Array.prototype.slice.call(arguments)); 
						ctx["_CF_" + fn].apply(ctx, arguments);
					}
				})(fn);
			}
		}

		//Start collecting the frames
		(function tick() {
			if(that.collectFPS) that.frames++, requestAnimationFrame(tick);
		})();
	};

	/**
	 * Stop profiling
	 * @return {null}
	 */
	Profile.prototype.end = function() {
		this.collectFPS = false;
		this.duration = ((new Date()).getTime()) - this.startTime;
		this.FPS = (this.frames * 1000)/this.duration; //TODO: fix this formula

		//Remove the man in the middle
		var ctx = this.ctx;
		for(var fn in ctx) {
			if(fn.match(/_CF_/)) {
				fn = fn.replace("_CF_", "");
				ctx[fn] = ctx["_CF_" + fn];
				delete ctx["_CF_" + fn]; //And remove the cache
			}
		}
	}

	/**
	 * Return the useful data from the context
	 * to represent the state of the context
	 * Only adds the properties and not functions
	 * @param  {CanvasRenderContext2D} ctx The context to make a state from
	 * @return {Object}     State object
	 */
	Profile.prototype.returnState = function(ctx) {
		var obj = {};
		if(!this._stateKeys) {
			this._stateKeys = [];
			for(var key in ctx) {
				if(typeof ctx[key] == "string" || typeof ctx[key] == "number") this._stateKeys.push(key), obj[key] = ctx[key];
			}
		} else {
			for (var i = this._stateKeys.length - 1; i >= 0; i--) {
				var key = this._stateKeys[i];
				obj[key] = ctx[key];
			};
		}

		return obj;
	};

	/**
	 * Add a state object to the current profile
	 * @param {StateObject} state See Profile#returnState
	 */
	Profile.prototype.addState = function(state) {
		this.stack.push(["state", state]);
	};

	/**
	 * Add a function call to the current profile
	 * @param {string} fn   The function name
	 * @param {array}   args The array of arguments passed to the function
	 */
	Profile.prototype.addFunctionCall = function(fn, args) {
		this.stack.push(["functionCall", fn, args]);
	};

	/**
	 * Output the profile to the console in a nice, readable way.
	 * @return {null} 
	 */
	Profile.prototype.outputToConsole = function() {
		var prevState = [], group = 1, scope = 1;
		var callCount = 0, stateChanges = 0;

		//console.group is a synchronous so this led to some
		//messy state saving and changing but it works in the end
		console.group("Canvas snapshot");
		//console.log("%cFPS: %c" + this.FPS, "color: green", "color: #000"); Fix the formula!

		console.group("Rendering");
		this.stack.forEach(function(item, i) {
			switch(item[0]) {
				case "functionCall":
					callCount++;

					if(item[1] == "save") console.groupCollapsed("Saved Draw State #" + group), group++, scope++;
					console.log("%c" + item[1] + "%c(" + item[2].join(", ") + ")", "color: blue; font-style: italic", "color: #000");
					if(item[1] == "restore") console.groupEnd(), scope--;
				break;

				case "state":
					var state = item[1];

					if(!prevState.length) {
						console.groupCollapsed("Initial state");
						for(var key in state) console.log(key + " = " + state[key]);
						console.groupEnd();
					} else {
						for(var key in state)
							if(prevState[scope] && prevState[scope][key] !== state[key]) 
								console.log("%c" + key + " %c= " + state[key], "color: purple; font-style: italic", "color: #000"), stateChanges++;
					}
					
					prevState[scope] = state;
				break;
			}
		});
		console.groupEnd();
	
		//Add the screenshot
		console.groupCollapsed("Screenshot");
		console.screenshot(this.canvas, function() {
			console.groupEnd(); //End the screenshot group

			console.group("Statistics"); //Stats group
			console.log("Function call count: ", callCount);
			console.log("State change count: ", stateChanges);
			console.groupEnd(); //End stats group

			console.groupEnd(); //End the major group
		});
	};

	/**
	 * Display an image in the console.
	 * @param  {string} url The url of the image.
	 * @param  {int} scale Scale factor on the image
	 * @return {null}   
	 */
	console.image = function(url, scale, callback) {
		if(typeof scale == "function") callback = scale, scale = 1;
		if(!scale) scale = 1;

		var img = new Image();

		img.onload = function() {
			var dim = getBox(this.width * scale, this.height * scale);
			console.log("%c" + dim.string, dim.style + "background-image: url(" + url + "); background-size: " + (this.width * scale) + "px " + (this.height * scale) + "px; color: transparent;");
			if(callback) callback();
		};

		img.src = url;
		img.style.background = "url(" + url + ")"; //Preload it again..
	};

	/**
	 * Snapshot a canvas context and output it to the console.
	 * @param  {HTMLCanvasElement} canvas The canvas element
	 * @return {null}         
	 */
	console.screenshot = function(canvas, scale) {
		var url = canvas.toDataURL(),
			width = canvas.width,
			height = canvas.height,
			scale = scale || 1,
			dim = getBox(width * scale, height * scale);

		console.log("%c" + dim.string, dim.style + "background-image: url(" + url + "); background-size: " + (width * scale) + "px " + (height * scale) + "px; color: transparent;");
	};

	/**
	 * Snapshot/Profile a canvas element
	 * @param  {HTMLCanvasElement} canvas The canvas element to profile
	 * @return {null}        
	 */
	console.snapshot = function(canvas) {
		//Start the profiling.
		var profile = new Profile(canvas.getContext("2d"), canvas);
		requestAnimationFrame(function() {
			profile.end();
			profile.outputToConsole();
		});
	}
})(console);

# console.snapshot( _canvas_ )
### A simple canvas profiler

`console.snapshot` takes and inputted _&lt;canvas&gt;_ element and outputs a snapshot of it into the console. It makes debugging the canvas a little less dramatic. See [this demo](http://dunxrion.github.io/console.snapshot). `console.snapshot` is a fork of the [`console.image`](http://github.com/dunxrion/console.image) and actually does something useful.

![The demo](http://i.imgur.com/fA0UGXT.png)

## Usage
### console.snapshot( _&lt;canvas&gt;_ )
`console.snapshot` profiles a canvas for 1 iteration in the browser render loop or for one `requestAnimationFrame` tick and outputs the canvas context call stack and state changes to the console.

```js
var canvas = document.getElementById("canvas");

console.snapshot(canvas);
```

![Sample output](http://i.imgur.com/CCO85C5.png);

### console.screenshot( _&lt;canvas&gt;_ [, _&lt;scale&gt;_ ] )
`console.screenshot` takes in a `HTMLCanvasElement`, base64 encodes it using `toDataURL` and then outputs it to the canvas using `console.image`. You can also pass along an optional scale factor to scale down the outputted image for better viewing within the Dev tools.

```js
var canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d");

	// ...
	//draw
	// ...

console.screenshot(canvas);
console.screenshot(canvas, 0.8); //Snapshot it and scale the output to 80% of the original size
```

![Screenshot demo](http://i.imgur.com/e1EUuhM.png)

### console.image( _&lt;url&gt;_ )
`console.image` outputs an image from a url into the console. See [console.image](http://github.com/dunxrion/console.image).

```js
console.image("http://i.imgur.com/wWPQK.gif");
```

## Troubleshooting
##### I'm getting "Uncaught Error: SecurityError: DOM Exception 18" when I try to snapshot the canvas.
This is caused by printing a non CORS-enabled image on the canvas. The browser blocks the `toDataURL` function which is what `console.image` depends on to print the canvas. To fix this, see [this tutorial on HTML5Rocks](http://www.html5rocks.com/en/tutorials/cors/) or consider passing your image through a CORS proxy such as [corsproxy.com](http://corsproxy.com).

License: MIT
# console.snapshot( _canvas_ )
### Snapshot a canvas and output it to the console.

`console.snapshot` takes and inputted _&lt;canvas&gt;_ element and outputs a snapshot of it into the console. It makes debugging the canvas a little less dramatic. See [this demo](http://dunxrion.github.io/console.snapshot). `console.snapshot` is a fork of the [`console.image`](http://github.com/dunxrion/console.image) and actually does something useful.

![The demo](http://i.imgur.com/IYLD8pz.png)

## Usage
### console.snapshot( _&lt;canvas&gt;_ )
`console.snapshot` takes in a `HTMLCanvasElement`, base64 encodes it using `toDataURL` and then outputs it to the canvas using `canvas.image`.

```js
var canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d");

	// ...
	//draw
	// ...

console.snapshot(canvas);
```

### console.image( _&lt;url&gt;_ )
`console.image` outputs and image from a url into the console. See [console.image](http://github.com/dunxrion/console.image).

```js
console.image("http://i.imgur.com/wWPQK.gif");
```

License: MIT
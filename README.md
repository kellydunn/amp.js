```
                                __
   __      ___ ___   _____     /\_\    ____
 /'__`\  /' __` __`\/\ '__`\   \/\ \  /',__\
/\ \L\.\_/\ \/\ \/\ \ \ \L\ \__ \ \ \/\__, `\
\ \__/.\_\ \_\ \_\ \_\ \ ,__/\_\_\ \ \/\____/
 \/__/\/_/\/_/\/_/\/_/\ \ \/\/_/\ \_\ \/___/
                       \ \_\   \ \____/
                        \/_/    \/___/
```

# what

A javascript audio histogram for your phat beats or smoof jamz.

# why

I like watching bouncy basslines in my browser.

Inspired by `http://www.storiesinflight.com/jsfft/visualizer/index.html`

# support

HTML5 ain't easy.
Chrome and Firefox only.

# dependencies

This project currently depends on:

- dsp.js  `https://github.com/corbanbrook/dsp.js`
- fs.js   `https://github.com/podviaznikov/fs.js`

# download

For the time being, it's best to clone the repository and either build the latest `amp.min.js`, or just copy the current minified version in the `min` folder

# build

The build process makes use of some handy ruby gems, specifically `juicer`

```
bundle install
rake
```

This will provide you with an `amp.pack.js` (a merged version of the project for debugging)
and an `amp.min.js` (a production-ready version of the project)

# usage

Require `amp.pack.js` or `amp.min.js` in your page somewhere:

```
<script type="text/javascript" src="path/to/amp.min.js"></script>
```

then get crackin at specifiying your histogram:

```
Amp.Visualizer.color = 'red';
Amp.Visualizer.canvas = document.getElementById('fft'); // Or your own canvas element.
Amp.Manager.mp3 = "/your/mega/nasty/track.mp3"
// Remeber that Firefox doesn't use mp3s, you'll have to go with ogg for now :\
Amp.Manager.ogg = "/your/mega/nasty/track.ogg"
Amp.Manager.init_page();
```

# demo

`http://kelly-dunn.net/amp`

You can change the visualization values of the histogram on the fly!  Open up a debugger and change some values, like:

```
Amp.Visualizer.color
Amp.Visualizer.bar_height
Amp.Visualizer.bar_width
```

# TODOs

- Perfect demo!
- Create custom Visualizations.

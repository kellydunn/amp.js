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

# download

For the time being, it's best to clone the repository and either build the latest `amp.min.js`, or just copy the current minified version in the `min` folder

# build

The build process makes use of some handy ruby gems, specifically `juicer`

```
bundle install
rake
```

# usage

Require `amp.pack.js` or `amp.min.js` in your page somewhere:

```
<script type="text/javascript" src="path/to/amp.min.js"></script>
```

then get crackin at specifiying your histogram:

```
Amp.Visualizer.color = 'red';
Amp.Manager.url = "/your/mega/nasty/track.mp3"
Amp.Manager.init_audio();
```

This will provide you with an `amp.pack.js` (a merged version of the project for debugging)
and an `amp.min.js` (a production-ready version of the project)

# TODOs

- Make webkit / mozilla differentiation a bit more modular
- Create other default Visualizations / anonymous callbacks for your own visualizations.

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

# support

HTML5 ain't easy.
Chrome and Firefox only.

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

# build

If you want to debug or otherwise contribute to the project, you can build (merge / minify) amp.js with a few ruby helpers:

```
bundle install
rake
```

This will provide you with a amp.pack.js (a merged version of the project for debugging)
and amp.min.js (a production-ready version of the project)

# TODOs

- Refine customization parameters.
- Create other Visualizations / anonymous callbacks for your own visualizations.

# install

Just include it in your `<head>` tag, son.

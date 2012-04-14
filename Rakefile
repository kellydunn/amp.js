desc "builds (read: merges and minifies amp.js"

# TODO Juicer errors out if you supply with recursive dir structure src/**/*
task :build do
  `juicer merge -s src/amp.js src/amp/*.js src/amp/**/*.js -o min/amp.pack.js --force`
  `juicer merge -s -m closure_compiler src/amp.js src/amp/*.js src/amp/**/*.js -o min/amp.min.js --force`
end

task :default => :build

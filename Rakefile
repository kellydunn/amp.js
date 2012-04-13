desc "builds (read: merges and minifies amp.js"
task :build do
  `juicer merge -s src/amp.js src/**/* -o min/amp.pack.js --force`
  `juicer merge -s -m closure_compiler src/amp.js src/**/* -o min/amp.min.js --force`
end

task :default => :build

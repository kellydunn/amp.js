desc "builds (read: merges and minifies amp.js"
task :build do
  `juicer merge -s -m closure_compiler src/amp.js --force`
end

task :default => :build

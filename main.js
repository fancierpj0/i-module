let path = require('path');
let fs = require('fs');
let vm = require('vm');

function Module(filename) {
  this.filename = filename;
  this.exports = {};
  this.loaded = false;
}

Module._cache = {};
Module._extentions = ['.js', '.json', '.node'];
Module._wrapper = [
  "(function(exports,req,module,__dirname,__filename){\r\n"
  , "\r\n})"
];
Module._wrap = function (script) {
  return Module._wrapper[0] + script + Module._wrapper[1];
};

Module._resolvePathname = function (filename) {
  let p = path.resolve(__dirname, filename);
  if (!path.extname(p)) {
    for (let i = 0; i < Module._extentions.length; ++i) {
      let newP = p + Module._extentions[i];
      console.log(i)
      try{
        fs.accessSync(newP);
        return newP;
      }catch(e){if(i===Module._extentions.length)console.error('非法路径！！')}
    }
  }else{
    try{
      fs.accessSync(p);
      return p;
    }catch(e){console.error('非法路径！！')}
  }

};

Module.prototype.load = function(){
  let ext = path.extname(this.filename).slice(1);
  Module._extentions[ext](this);
};

Module._extentions['js'] = function(module){
  let script = fs.readFileSync(module.filename,'utf8');
  script = Module._wrap(script);
  vm.runInThisContext(script).call(module.exports,module.exports,req,module);
};

Module._extentions['json'] = function(module){
  let json = fs.readFileSync(module.filename,'utf8');
  json = JSON.parse(json);
  return module.exports = json;
};

function req(filename) {
  filename = Module._resolvePathname(filename);

  let cacheModule = Module._cache[filename];
  if (cacheModule) {
    return cacheModule.exports;
  }

  let module = new Module(filename);
  module.load();
  Module._cache[filename] = module;
  module.loaded = true;
  return module.exports;
}

let s1 = req('./test-case/1.js');
console.log(s1);
let j1 = req('./test-case/1.json');
console.log(j1);
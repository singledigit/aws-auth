/**
 * Created by ericjohnson on 3/29/16.
 */

Object.defineProperty(exports, "__esModule", {value: true});

var fs = require('fs'),
  path = require('path'),
  mods = require('../package.json');

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

function getModules(){
  var keys = Object.keys(mods.dependencies),
    explodedKeys = [];
  for (var i = 0; i < keys.length; i++) {
    explodedKeys.push('node_modules/' + keys[i] + "/**/*");
  }
  return explodedKeys;
}

function getProperty(conf, logical, prop){
  var stack = conf.StackResources;

  var f = stack.filter(function(item){
    return item["LogicalResourceId"] === logical;
  });

  if(f.length > 0) return f[0][prop];
  return '';
}

exports.getFolders = getFolders;
exports.getModules = getModules;
exports.getProperty = getProperty;
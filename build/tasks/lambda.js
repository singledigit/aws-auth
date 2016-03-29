/**
 * Created by ericjohnson on 3/28/16.
 */

var gulp = require('gulp'),
  fs = require('fs'),
  path = require('path'),
  babel = require("gulp-babel"),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  args = require('get-gulp-args')(),
  mods = require('../../package.json'),
  shell = require('gulp-shell'),
  rename = require('gulp-rename'),
  vinyl = require('vinyl-paths'),
  zip = require('gulp-zip'),
  merge = require('merge-stream'),
  del = require('del');

var lambda = (args.lambda || '').toLowerCase(),
    lambdaPath = 'dist/lambdas/' + lambda + '/',
    env = (args.env || 'development').toLocaleLowerCase(),
    zipFile = lambda + '.zip',
    deploy = args.deploy === "true";

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

gulp.task('clean', function () {
  return gulp.src('dist/')
    .pipe(vinyl(del));
});

gulp.task("compile", ['clean'], function () {
  return gulp.src("src/**/*.js")
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('collect', ['compile'], function(){
  var folders = getFolders('dist/lambdas');
  var keys = getModules();

  var resource = folders.map(function(folder){
    return gulp.src('configs/resource-' + env + '.json')
      .pipe(rename('resources.json'))
      .pipe(gulp.dest('dist/lambdas/' + folder + '/'))
  });

  var library = folders.map(function(folder){
    return gulp.src('dist/lib/*')
      .pipe(gulp.dest('dist/lambdas/' + folder + '/lib'))
  });

  var modules = folders.map(function(folder){
    return gulp.src(keys, {base: "."})
      .pipe(gulp.dest('dist/lambdas/' + folder + '/'))
  });

  return merge(resource, library, modules);
});

gulp.task('package', ['collect'], function(){
  var folders = getFolders('dist/lambdas');

  var pack = folders.map(function(folder){
    return gulp.src('dist/lambdas/' + folder + '/**/*.*')
      .pipe(zip(folder + '.zip'))
      .pipe(gulp.dest('dist/lambdas/' + folder));
  });

  return merge(pack);
});

gulp.task('aws', function () {
  return shell([
    "aws lambda update-function-code --function-name " + lambda + "" + env + " --zip-file fileb://" + lambdaPath + "" + zipFile + " --profile --profile singledigit"
  ])
});


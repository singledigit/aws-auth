/**
 * Created by ericjohnson on 3/28/16.
 */

var gulp = require('gulp'),
  app = require('../../configs/app.json'),
  babel = require("gulp-babel"),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  args = require('get-gulp-args')(),
  shell = require('gulp-shell'),
  rename = require('gulp-rename'),
  vinyl = require('vinyl-paths'),
  zip = require('gulp-zip'),
  merge = require('merge-stream'),
  helpers = require('../helpers'),
  del = require('del');

var lambda = (args.lambda || '').toLowerCase(),
    env = (args.env || 'development').toLocaleLowerCase(),
    deploy = false,
    conf = require('../../configs/resource-' + env + '.json');



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
  var folders = helpers.getFolders('dist/lambdas');
  var keys = helpers.getModules();

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
  var folders = helpers.getFolders('dist/lambdas');

  var pack = folders.map(function(folder){
    return gulp.src('dist/lambdas/' + folder + '/**/*.*')
      .pipe(zip(folder + '.zip'))
      .pipe(gulp.dest('dist/lambdas/' + folder))
  });

  return merge(pack);
});

gulp.task('deploy', ['package'], function () {
  var folders = helpers.getFolders('dist/lambdas'),
    l = helpers.getProperty(conf, 'Lambda' + lambda, 'PhysicalResourceId');

  var aws = folders.map(function(folder){
    var lambdaName = helpers.getProperty(conf, 'Lambda' + folder, 'PhysicalResourceId');
    return gulp.src('dist/lambdas/' + folder + '/*.zip')
      .pipe(shell([
        "aws lambda update-function-code --function-name " + lambdaName + " --zip-file fileb://dist/lambdas/" + folder + "/" + folder + ".zip --profile " + app.profile
      ]))
  });

  return merge(aws);
});


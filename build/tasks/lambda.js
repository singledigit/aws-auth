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
  del = require('del');

var lambda = (args.lambda || '').toLowerCase(),
    lambdaPath = 'dist/lambdas/' + lambda + '/',
    env = (args.env || 'development').toLocaleLowerCase();

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

gulp.task('clean', function () {
  return gulp.src('dist/')
    .pipe(vinyl(del));
});

gulp.task("compile-code", function () {
  return gulp.src("src/**/*.js")
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("copy-npm-modules", function () {
  var keys = Object.keys(mods.dependencies),
    explodedKeys = [];
  for (var i = 0; i < keys.length; i++) {
    explodedKeys.push('node_modules/' + keys[i] + "/**/*");
  }
  return gulp.src(explodedKeys, {base: "."})
    .pipe(gulp.dest(lambdaPath));
});

gulp.task('copy-library', function () {
  gulp.src('dist/lib/*')
    .pipe(gulp.dest(lambdaPath + 'lib'));
});

gulp.task("copy-resource-config", function () {
  return gulp.src('./configs/resource-' + env + '.json')
    .pipe(rename('resources.json'))
    .pipe(gulp.dest(lambdaPath));
});

gulp.task("build-all", function () {
  var runSequence = require('run-sequence').use(gulp),
    folders = getFolders('src/lambdas');

  if(lambda){
    lambdaPath = 'dist/lambdas/' + lambda + '/';
    return runSequence('describe-stack-resources', 'clean', 'compile-code', 'copy-npm-modules', 'copy-library', 'copy-resource-config');
  } else {
    for (var i = 0; i < folders.length; i++) {
      lambdaPath = 'dist/lambdas/' + folders[i] + '/';
      runSequence('describe-stack-resources', 'clean', 'compile-code', 'copy-npm-modules', 'copy-library', 'copy-resource-config');
    }
  }
});
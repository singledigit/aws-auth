/**
 * Created by ericjohnson on 3/26/16.
 */

var gulp = require('gulp'),
    shell = require('gulp-shell'),
    template = require('./cloudform.json');

gulp.task('update-stack', shell.task([
  'aws cloudformation update-stack --stack-name Auth --template-body file://./cloudform.json --parameters file://./cloudform-development.json --capabilities CAPABILITY_IAM --profile singledigit'
]));
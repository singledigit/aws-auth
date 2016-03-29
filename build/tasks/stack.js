/**
 * Created by ericjohnson on 3/28/16.
 */

var gulp = require('gulp'),
  app = require('../../configs/app.json'),
  shell = require('gulp-shell'),
  args = require('get-gulp-args')();

var stack = (args.stack || '').toLowerCase(),
  env = (args.env || 'development').toLowerCase(),
  action = '';

action += '--stack-name ' + stack + '-' + env + ' --template-body file://./cloudformation/' + stack + '.json ';
action += '--parameters file://./cloudformation/' + stack + '-' + env + '.json ';
action += '--capabilities CAPABILITY_IAM --profile singledigit';

gulp.task('create-stack', shell.task([
  'aws cloudformation create-stack ' + action
]));

gulp.task('update-stack', shell.task([
  'aws cloudformation update-stack ' + action
]));

gulp.task('delete-stack', shell.task([
  'aws cloudformation delete-stack ' + stack + "-" + env
]));

gulp.task('describe-stack-resources', function () {
  return shell([
    'aws cloudformation describe-stack-resources --stack-name  auth-' + env + ' --profile ' + app.profile + ' > configs/resource-' + env + '.json'
  ])
});

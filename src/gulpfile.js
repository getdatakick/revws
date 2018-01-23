var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./webpack-config');
var del = require('del');
var eslint = require('gulp-eslint');
var zip = require('gulp-zip');
var ramda = require('ramda');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var { append, prepend, map, flatten } = ramda;

var deployDir = "./build";

function getFolders(dir) {
  return flatten(fs
    .readdirSync(dir)
    .filter(file => fs.statSync(path.join(dir, file)).isDirectory())
    .map(file => {
      const subdirs = getFolders(dir+'/'+file);
      return prepend(dir+'/'+file, subdirs);
    })
  );
}

gulp.task("devel", function() {
  gulp.src(['./index.html']).pipe(gulp.dest(deployDir));
  var compiler = webpack(config(false));
  compiler.hot = true;

  new WebpackDevServer(compiler, {
    contentBase: "./build",
    hot: true,
    quiet: true,
    stats: {colors: true}
  }).listen(8080, "localhost", function(err) {
    if (err)
      throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
  });
});

gulp.task('eslint', function(done) {
  return gulp.src(['./js/**/*.js', './js/**/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('end', done);
});

gulp.task('clean', function(done) {
  del.sync(['./build'], { force: true });
  done();
});

gulp.task('build-javascript', function(done) {
  process.env.NODE_ENV = 'production';
  gulp.src('./js')
    .pipe(webpackStream(config(true), webpack))
    .pipe(gulp.dest('./build'))
    .on('end', done);
});

gulp.task('copy-javascript', function(done) {
  gulp.src('./build/*.js')
    .pipe(gulp.dest('../views/js'))
    .on('end', done);
});

gulp.task('create-zip', function(done) {
  return gulp
    .src('./build/staging/**/*')
    .pipe(zip('revws.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-files', function(done) {
  const ext = ['php', 'tpl', 'css', 'js', 'xml', 'md', 'sql', 'html', 'txt'];
  const sources = append('!../src/**', map(e => '../**/*.'+e, ext));
  return gulp
    .src(sources)
    .pipe(gulp.dest('./build/staging/revws'))
    .on('end', done);
});

gulp.task('copy-build', function(done) {
  return gulp
    .src(['./build/front_app.js', './build/back_app.js'])
    .pipe(gulp.dest('./build/staging/revws/views/js'))
    .on('end', done);
});

gulp.task('create-index', function(done) {
  var folders = getFolders('./build/staging/revws');
  var tasks = folders.map(folder => gulp.src('../index.php').pipe(gulp.dest(folder)));
  return merge(tasks);
});

gulp.task('stage', gulp.series('copy-files', 'copy-build', 'create-index'));

gulp.task('build', gulp.series('clean', 'build-javascript', 'copy-javascript'));

gulp.task('release', gulp.series('build', 'stage', 'create-zip'));

gulp.task('default', gulp.series('devel'));

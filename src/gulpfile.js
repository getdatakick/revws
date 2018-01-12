var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./webpack-config');
var del = require('del');
var eslint = require('gulp-eslint');

var deployDir = "./build";

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

gulp.task('build', gulp.series('build-javascript'));

gulp.task('default', gulp.series('devel'));

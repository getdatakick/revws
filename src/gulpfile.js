var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./webpack-config');
var translateConfig = require('./webpack-config-translation');
var del = require('del');
var eslint = require('gulp-eslint');
var zip = require('gulp-zip');
var ramda = require('ramda');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var replace = require('gulp-replace');
var exec = require('child_process').exec;
var { find, sortBy, identity, values, mapObjIndexed, append, prepend, map, flatten } = ramda;

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

function getLatestCommitHash(cb) {
  exec('git log -n 1 --pretty=format:"%h"', (err, stdout, stderr) => {
    if (err || !stdout) {
      throw new Error(err);
    }
    cb(stdout);
  });
}

function getVersion() {
  var raw = fs.readFileSync('../revws.php', 'utf8');
  var lines = map(line => line.replace(/\s+/g, ""), raw.split("\n"));
  var line = find(line => line.indexOf("$this->version") === 0, lines);
  if (line) {
    return line.replace(/[^0-9\.]+/g, '');
  }
  throw new Error("version not found");
}

function readTranslations(path) {
  var keys = JSON.parse(fs.readFileSync(path, 'utf8'));
  return sortBy(identity, values(mapObjIndexed((value, key) => {
    return '"' + key + '" => $this->l(\'' + value.replace(/'/g, "\\'") +'\')';
  }, keys)));
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
  var version = getVersion();
  var fileVersion = version.replace(/\./g, '_');
  return gulp
    .src('./build/staging/**/*')
    .pipe(zip('revws-'+fileVersion+'.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-text-files', function(done) {
  getLatestCommitHash(commit => {
    const ext = ['php', 'tpl', 'css', 'js', 'sql', 'html', 'xml', 'md'];
    const sources = append('!../.tbstore/**', append('!../src/**', map(e => '../**/*.'+e, ext)));
    return gulp
      .src(sources)
      .pipe(replace(/CACHE_CONTROL/, commit))
      .pipe(gulp.dest('./build/staging/revws'))
      .on('end', done);
  });
});

gulp.task('copy-binary-files', function(done) {
  const ext = ['png'];
  const sources = append('!../.tbstore/**', append('!../src/**', map(e => '../**/*.'+e, ext)));
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

gulp.task('extract-front-translations', function(done) {
  process.env.NODE_ENV = 'production';
  gulp.src('./js')
    .pipe(webpackStream(translateConfig('front'), webpack))
    .pipe(gulp.dest('./build'))
    .on('end', () => {
      del.sync(['./build/transl.js'], { force: true });
      done();
    });
});

gulp.task('extract-back-translations', function(done) {
  process.env.NODE_ENV = 'production';
  gulp.src('./js')
    .pipe(webpackStream(translateConfig('back'), webpack))
    .pipe(gulp.dest('./build'))
    .on('end', () => {
      del.sync(['./build/transl.js'], { force: true });
      done();
    });
});


gulp.task('create-translations', function(done) {
  const frontTranslations = readTranslations('./build/front-translation-keys.json');
  const backTranslations = readTranslations('./build/back-translation-keys.json');
  gulp
    .src('../app-translation.php')
    .pipe(replace(/([ ]*)\/\/ FRONT_TRANSLATIONS/, (_, spaces) => {
      return spaces + frontTranslations.join(",\n"+spaces);
    }))
    .pipe(replace(/([ ]*)\/\/ BACK_TRANSLATIONS/, (_, spaces) => {
      return spaces + backTranslations.join(",\n"+spaces);
    }))
    .pipe(gulp.dest('./build/staging/revws/'))
    .on('end', done);
});

gulp.task('translate', gulp.series('extract-front-translations', 'extract-back-translations', 'create-translations'));

gulp.task('stage', gulp.series('copy-text-files', 'copy-binary-files', 'copy-build', 'create-index', 'translate'));

gulp.task('build', gulp.series('clean', 'build-javascript', 'copy-javascript'));

gulp.task('release', gulp.series('build', 'stage', 'create-zip'));

gulp.task('default', gulp.series('devel'));

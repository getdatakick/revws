var gulp = require('gulp');
var PluginError = require('plugin-error');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./js/webpack-config');
var translateConfig = require('./js/webpack-config-translation');
var del = require('del');
var eslint = require('gulp-eslint');
var zip = require('gulp-zip');
var ramda = require('ramda');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var replace = require('gulp-replace');
var exec = require('child_process').exec;
var rename = require('gulp-rename');
var license = require('gulp-license-check');
var { find, sortBy, identity, values, mapObjIndexed, append, prepend, map, flatten } = ramda;

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
  var raw = fs.readFileSync('php/revws.php', 'utf8');
  var lines = map(line => line.replace(/\s+/g, ""), raw.split("\n"));
  var line = find(line => line.indexOf("$this->version") === 0, lines);
  if (line) {
    return line.replace(/[^0-9\.]+/g, '');
  }
  throw new Error("version not found");
}

function getFileVersion() {
  return getVersion().replace(/\./g, '_');
}

function getBootstrapJs() {
  return 'revws-bootstrap-' + getFileVersion() + '.js';
}

function readTranslations(path) {
  var keys = JSON.parse(fs.readFileSync(path, 'utf8'));
  return sortBy(identity, values(mapObjIndexed((value, key) => {
    return '"' + key + '" => $this->l(\'' + value.replace(/'/g, "\\'") +'\')';
  }, keys)));
}

gulp.task("devel", function() {
  var compiler = webpack(config(false, getVersion()));

  new WebpackDevServer(compiler, {
    contentBase: "./build",
    disableHostCheck: true,
    publicPath: '/',
    public: 'thirtybees.local:8080',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    stats: {
      colors: true
    }
  }).listen(8080, "localhost", function(err) {
    if (err) {
      throw new PluginError("webpack-dev-server", err);
    }
  });
});

gulp.task('clean', function(done) {
  del.sync(['./build'], { force: true });
  done();
});

gulp.task('build-javascript', function() {
  process.env.NODE_ENV = 'production';
  return gulp.src('js')
    .pipe(webpackStream(config(true, getVersion()), webpack))
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-javascript', function(done) {
  gulp.src('./build/*.js')
    .pipe(gulp.dest('./build/staging/revws/views/js'))
    .on('end', done);
});

gulp.task('create-zip', function(done) {
  var fileVersion = getFileVersion();
  return gulp
    .src('./build/staging/**/*')
    .pipe(zip('revws-'+fileVersion+'.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('copy-text-files', function(done) {
  getLatestCommitHash(commit => {
    const version = getVersion();
    const bootstrapJs = getBootstrapJs();
    const ext = ['php', 'tpl', 'js', 'sql', 'html', 'md', 'txt'];
    let sources = map(e => 'php/**/*.'+e, ext);
    sources = append('php/**/back.css', sources);
    sources = append('php/**/fallback.css', sources);
    sources = append('php/**/css/themes/*.css', sources);
    sources = append('!php/license-header.*', sources);
    sources = append('!php/**/revws_bootstrap.js', sources);
    return gulp
      .src(sources)
      .pipe(replace(/CACHE_CONTROL/g, commit))
      .pipe(replace(/CONSTANT_VERSION/g, version))
      .pipe(replace(/revws_bootstrap.js/g, bootstrapJs))
      .pipe(gulp.dest('./build/staging/revws'))
      .on('end', done);
  });
});

gulp.task('copy-bootstrap-js', function(done) {
  return gulp
    .src(['php/**/revws_bootstrap.js'])
    .pipe(rename(getBootstrapJs()))
    .pipe(gulp.dest('./build/staging/revws/views/js/'))
    .on('end', done);
});

gulp.task('copy-binary-files', function(done) {
  const ext = ['png', 'svg', 'jpg'];
  const sources = [];
  for (var i=0; i<ext.length; i++) {
    const e = ext[i];
    sources.push('php/**/*.'+e);
    sources.push('!php/data/**/*.'+e);
  }
  return gulp
    .src(sources)
    .pipe(gulp.dest('./build/staging/revws'))
    .on('end', done);
});

gulp.task('copy-build', function(done) {
  const ver = getFileVersion();
  return gulp
    .src(['./build/front-'+ver+'.js', './build/back-'+ver+'.js'])
    .pipe(gulp.dest('./build/staging/revws/views/js'))
    .on('end', done);
});

gulp.task('create-index', function(done) {
  if (!fs.existsSync('./build/staging/revws/translations')){
    fs.mkdirSync('./build/staging/revws/translations');
  }
  if (!fs.existsSync('./build/staging/revws/data')) {
    fs.mkdirSync('./build/staging/revws/data');
  }
  if (!fs.existsSync('./build/staging/revws/data/images')) {
    fs.mkdirSync('./build/staging/revws/data/images');
  }
  var folders = getFolders('./build/staging/revws');
  var tasks = folders.map(folder => gulp.src('php/index.php').pipe(gulp.dest(folder)));
  return merge(tasks);
});

gulp.task('create-config-xml', function(done) {
  const version = getVersion();
  return gulp.src(['php/config.xml.src'])
    .pipe(replace(/CONSTANT_VERSION/g, version))
    .pipe(rename('config.xml'))
    .pipe(gulp.dest('./build/staging/revws'))
    .on('end', done);
});

gulp.task('extract-front-translations', function(done) {
  process.env.NODE_ENV = 'production';
  gulp.src('js')
    .pipe(webpackStream(translateConfig('front'), webpack))
    .pipe(gulp.dest('./build'))
    .on('end', () => {
      del.sync(['./build/transl.js', './build/transl.js.LICENSE.txt'], { force: true });
      done();
    });
});

gulp.task('extract-back-translations', function(done) {
  process.env.NODE_ENV = 'production';
  gulp.src('js')
    .pipe(webpackStream(translateConfig('back'), webpack))
    .pipe(gulp.dest('./build'))
    .on('end', () => {
      del.sync(['./build/transl.js', './build/transl.js.LICENSE.txt'], { force: true });
      done();
    });
});


gulp.task('create-translations', function(done) {
  const frontTranslations = readTranslations('./build/front-translation-keys.json');
  const backTranslations = readTranslations('./build/back-translation-keys.json');
  gulp
    .src('php/app-translation.php')
    .pipe(replace(/([ ]*)\/\/ FRONT_TRANSLATIONS/, (_, spaces) => {
      return spaces + frontTranslations.join(",\n"+spaces);
    }))
    .pipe(replace(/([ ]*)\/\/ BACK_TRANSLATIONS/, (_, spaces) => {
      return spaces + backTranslations.join(",\n"+spaces);
    }))
    .pipe(gulp.dest('./build/staging/revws/'))
    .on('end', done);
});

gulp.task('merge-translations-keys', function(done) {
  exec('php ./utils/merge-keys.php', (err, stdout, stderr) => {
    if (err) {
      throw new Error(err);
    }
    console.log(stdout.replace(/\s$/g, ""));
    done();
  });
});

gulp.task('translate', gulp.series('extract-front-translations', 'extract-back-translations', 'create-translations', 'merge-translations-keys'));

gulp.task('stage', gulp.series('copy-text-files', 'copy-binary-files', 'copy-bootstrap-js', 'copy-build', 'create-index', 'create-config-xml', 'translate'));

gulp.task('upload', function(done) {
  const file = path.resolve('./build/revws-'+getFileVersion()+'.zip');
  exec('release-module '+file+' revws free', (err, stdout, stderr) => {
    if (err) {
      throw new Error(err);
    }
    console.log(stdout);
    done();
  });
});

gulp.task('check-license-php', function() {
  return gulp
    .src(['php/**/*.php', '!php/translations/**'])
    .pipe(license({
      path: 'php/license-header.php',
      blocking: true,
      logInfo: false
    }));
});

gulp.task('check-license-tpl', function(done) {
  return gulp
    .src(['php/**/*.tpl'])
    .pipe(license({
      path: 'php/license-header.tpl',
      blocking: true,
      logInfo: false
    }));
});

gulp.task('check-license', gulp.series('check-license-php', 'check-license-tpl'));

gulp.task('build', gulp.series('clean', 'build-javascript', 'copy-javascript'));

gulp.task('release', gulp.series('clean', 'check-license', 'build-javascript', 'copy-javascript', 'stage', 'create-zip'));

gulp.task('default', gulp.series('devel'));

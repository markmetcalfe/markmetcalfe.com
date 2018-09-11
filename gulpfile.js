var fs = require('fs');
var path = require('path');
var del = require('del');
var gulp = require('gulp');
var browserify = require('browserify');
var injectSvg = require('gulp-inject-svg');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify-es').default;
var $$ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var reload = browserSync.reload;
var through2 = require('through2');
var htmlclean = require('gulp-htmlclean');
var replace = require('gulp-token-replace');
var config = require('./variables.json');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

var assetFolder = 'assets/';
var devFolder = 'src/';
var buildFolder = 'build/';
var toMove = buildFolder + 'index/*';

function getFolders(dir) {
  return fs.readdirSync(dir)
  .filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

gulp.task('styles', function() {
  return gulp.src(devFolder + '**/*.scss')
  .pipe($$.sass())
  .on('error', $$.notify.onError("Error: <%= error.message %>"))
  .on('error', handleError)
  .pipe($$.postcss([ autoprefixer({ browsers: ["> 0%"] }) ]))
  .pipe(gulp.dest(buildFolder))
  .pipe($$.minifyCss({keepSpecialComments: 1}))
  .pipe(gulp.dest(buildFolder))
  .pipe(reload({ stream:true }));
});

gulp.task('scripts', function() {
  var folders = getFolders(devFolder);
  if (folders.length === 0) return done();
  return folders.map(function(folder) {
    return gulp.src(path.join(devFolder, folder, '/**/*.js'))
    .pipe(through2.obj(function (file, enc, next){
      browserify(file.path)
      .transform(babelify)
      .bundle(function(err, res){
        file.contents = res;
        next(null, file);
      })
    }))
    .pipe(buffer())
    .pipe(uglify.apply())
    .pipe($$.sourcemaps.write('./'))
    .pipe($$.rename('bundle.js'))
    .pipe(gulp.dest(buildFolder + folder))
    .pipe(reload({ stream:true }));
  });
});

gulp.task('pages', function() {
  return gulp.src(devFolder + '**/*.html')
  .pipe(buffer())
  .pipe(replace({global:config}))
  .pipe(injectSvg({
    base: '/assets/'
  }))
  .pipe(gulp.dest(buildFolder))
	.pipe(reload({ stream:true }));
});

gulp.task('assets', function() {
  return gulp.src(assetFolder + '**/*')
  .pipe(gulp.dest(buildFolder))
	.pipe(reload({ stream:true }));
});

gulp.task('moveindex', ['styles', 'scripts', 'pages'], function() {
  return gulp.src(toMove)
  .pipe(gulp.dest(buildFolder))
});

gulp.task('clean', ['styles', 'scripts', 'pages', 'moveindex'], function() {
  fs.rmdir(toMove, err => {
    return del(toMove, {force:true});
  });
});

gulp.task('build', ['styles', 'scripts', 'assets', 'pages', 'moveindex', 'clean']);

gulp.task('serve', ['build'], function() {
  browserSync({ server: { baseDir: buildFolder } });
  gulp.watch(devFolder + '**/*', ['build'], reload);
});

gulp.task('default', ['build']);

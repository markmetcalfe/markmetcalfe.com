var path = require('path');
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
var replace = require('gulp-token-replace');
var config = require('./variables.json');

var assetFolder = 'assets/';
var devFolder = 'src/';
var buildFolder = 'build/';

gulp.task('styles', function() {
  return gulp.src(devFolder + '**/*.scss')
  .pipe($$.sass())
  .on('error', $$.notify.onError("Error: <%= error.message %>"))
  .pipe($$.postcss([ autoprefixer() ]))
  .pipe(gulp.dest(buildFolder))
  .pipe($$.minifyCss({keepSpecialComments: 1}))
  .pipe(gulp.dest(buildFolder))
  .pipe(reload({ stream:true }));
});

gulp.task('scripts', function() {
  return gulp.src(path.join(devFolder, '/*.js'))
    .pipe(
      through2.obj(function (file, enc, next) {
        browserify(file.path)
          .transform(babelify)
          .bundle(function(err, res){
            file.contents = res;
            next(null, file);
          })
      })
    )
    .pipe(buffer())
    .pipe(uglify.apply())
    .pipe($$.sourcemaps.write('./'))
    .pipe($$.rename('bundle.js'))
    .pipe(gulp.dest(buildFolder))
    .pipe(reload({ stream:true }));
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

gulp.task('build', gulp.parallel('styles', 'scripts', 'pages', 'assets'));

gulp.task('serve', gulp.series('build', function() {
  browserSync({ server: { baseDir: buildFolder } });
  gulp.watch(devFolder + '**/*', gulp.series('build'), reload);
}));

gulp.task('default', gulp.series('build'));

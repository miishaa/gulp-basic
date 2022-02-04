const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

const paths = {
  styles: {
    src: 'src/sass/**/*.scss',
    dest: 'app/css/',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'app/js/',
  },
  img: {
    src: 'src/img/**/*.{jpg,jpeg,png,gif,webp}',
    dest: 'app/img/',
  },
  html: {
    src: 'src/*.html',
    dest: 'app/',
  },
};

const clean = () => del(['app/*', '!app/img']);

const fonts = () => {
  return src('src/fonts/**').pipe(dest('app/fonts'));
};
const files = () => {
  return src('src/files/**').pipe(dest('app/files'));
};

const html = () => {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
};

const styles = () => {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(paths.styles.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(paths.scripts.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

const imgMin = () => {
  return src(paths.img.src)
    .pipe(newer(paths.img.dest))
    .pipe(imagemin())
    .pipe(dest(paths.img.dest))
    .pipe(browserSync.stream());
};

const webP = () => {
  return src(`${paths.img.dest}/*.*`)
    .pipe(webp())
    .pipe(dest(paths.img.dest))
    .pipe(browserSync.stream());
};

const follow = () => {
  browserSync.init({
    server: './app',
  });

  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.html.src, html);
  watch(paths.img.src, series(imgMin, webP));
};

exports.default = series(
  clean,
  imgMin,
  webP,
  parallel(fonts, files),
  parallel(styles, scripts, html),
  follow
);

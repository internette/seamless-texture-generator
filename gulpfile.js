'use strict';

var gulp = require('gulp');
// SCSS
var sass = require('gulp-sass');
var rename = require('gulp-rename');

gulp.task('sass', function () {
  return gulp.src('./css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('watch:sass', function () {
  gulp.watch('./css/*.scss', ['sass']);
});
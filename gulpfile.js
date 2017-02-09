var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var buffer = require('vinyl-buffer');

var header = "/* chartjs-plugin-downsample | AlbinoDrought | MIT License | https://github.com/AlbinoDrought/chartjs-plugin-downsample/blob/master/LICENSE | Based on flot-downsample, https://github.com/sveinn-steinarsson/flot-downsample/ */\n";
var outDir = "./";

gulp.task('build', buildTask);

function buildTask() {
    var build = browserify('./src/chartjs-plugin-downsample.js')
        .ignore('chart.js')
        .bundle()
        .pipe(source('chartjs-plugin-downsample.js'))
        .pipe(buffer())
        .pipe(insert.prepend(header))
        .pipe(gulp.dest(outDir))
        // min build
        .pipe(streamify(uglify()))
        .pipe(insert.prepend(header))
        .pipe(streamify(concat('chartjs-plugin-downsample.min.js')))
        .pipe(gulp.dest(outDir));

    return build;
}
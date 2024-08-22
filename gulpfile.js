const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require('gulp-autoprefixer'); // post CSS processor
const size = require("gulp-size");

// scss files to "watch" for changes
let scssFilesToWatch = [
  'src/scss/**/*.scss'
];

// scss files to "compile"
let scssFilesToCompile = [
    'src/scss/**/*.scss',
    // exclude scss partials as they will be "included" as needed
    '!' + 'src/scss/**/_*.scss',
];

// watch task
function watchFiles(cb) {
    watch(
        // watch these files
        scssFilesToWatch,
        // watch options
        {
            ignoreInitial: false    // compile on task startup
        },
        // run these tasks when you see a change
        series(deleteOlderFiles, compileAndMinifyCss)
    );
    // watch('test/js/**/*.js', 'compileJs');

    cb();
}

// css compile task
function compileAndMinifyCss(cb) {
  new Promise(function(resolve, reject) {
    src(scssFilesToCompile)
    .pipe(sourcemaps.init({
      loadMaps: true // load (any) existing source maps
    }))
    .pipe(sass({
      sourceMap: true,
      outputStyle: 'expanded',
      includePaths: ['node_modules/foundation-sites/scss'],
    }))
    .pipe(dest('dist/css/'))
    .on('error', reject)
    // create source maps for debugging
    .pipe(sourcemaps.write('./maps'))
    .pipe(size({ showFiles: true }))
    // save everything
    .pipe(dest('dist/css/'))
    .on('end', resolve)     // <---- indicates task completion if there are no errors

  }).then(function() {
    cb();   // <-- on task completion, callback function is executed - which kicks off any tasks scheduled to run after this task
  })
}

// clean-up task
function deleteOlderFiles(cb) {
    del('dist/css/**/*.css', { force: true });

    // indicate completion
    cb();
}

// task configuration
exports.default = compileAndMinifyCss;
exports.watch = series(watchFiles, deleteOlderFiles);

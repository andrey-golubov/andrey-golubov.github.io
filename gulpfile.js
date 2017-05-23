/* BASE modules */
const _path = require("path");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");

/* For style-sheets */
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const csso = require("gulp-csso");
const autoprefixer = require("gulp-autoprefixer");

/* For images */

/* PNG sprites */
const spritesmith = require('gulp.spritesmith');
/* SVG sprites */
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprites');

const DIST = process.env.DIST || "./dest";

const PATH = {
	SASS: {
		ENTRY: "./src/scss/main.scss",
		SRC: "./src/scss/**/*.scss",
		DIST: _path.join(DIST, "css"),
	},
	JS: {
		SRC: "./src/js/**/*.js",
		DIST: _path.join(DIST, "js"),
	},
	IMG: {
		BASE: {
			SRC: "./src/img/base/**/*.*",
			DIST: _path.join(DIST, "img"),
		},
		SPRITE: {
			SVG: {
				SRC: "./src/img/icons/svg/**/*.svg",
				OUTPUT: "symbol_sprite.html",
				DIST: _path.join(DIST, "img"),
			},
			PNG: {
				SRC: "./src/img/icons/png/**/*.png",
				NAME: "sprite.png",
				DIST: _path.join(DIST, "img"),
				CSS_NAME: "sprite.scss",
				CSS_DIST: "./src/scss/sprites",
			}
		}
	},
	HTML: {
		SRC: "./index.html",
	}
};

gulp.task("scss", function(){
	return gulp.src(PATH.SASS.ENTRY)
					.pipe(sourcemaps.init())
					.pipe(sassGlob())
					.pipe(sass().on('error', sass.logError))
					.pipe(autoprefixer({
						browsers: ['last 2 versions'],
						cascade: false
					}))
					.pipe(csso())
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(PATH.SASS.DIST))
					.pipe(browserSync.stream());
});

gulp.task("js", function(){
	return gulp.src(PATH.JS.SRC)
					.pipe(gulp.dest(PATH.JS.DIST))
					.pipe(browserSync.stream());
});

gulp.task("images:base", function(){
	return gulp.src(PATH.IMG.BASE.SRC)
					.pipe(gulp.dest(PATH.IMG.BASE.DIST))
					.pipe(browserSync.stream());
});

gulp.task("images:sprite:png", function(){
	let spriteData = gulp.src(PATH.IMG.SPRITE.PNG.SRC)
										.pipe(spritesmith({
											imgName: PATH.IMG.SPRITE.PNG.NAME,
											cssName: PATH.IMG.SPRITE.PNG.CSS_NAME,
											cssFormat: "css",
											imgPath: PATH.IMG.SPRITE.PNG.DIST,
											padding: 70,
										}));

	spriteData.img
		.pipe(gulp.dest(PATH.IMG.SPRITE.PNG.DIST))
		.pipe(browserSync.stream());
	spriteData.css
		.pipe(gulp.dest(PATH.IMG.SPRITE.PNG.CSS_DIST))
		.pipe(browserSync.stream());
});

gulp.task("images:sprite:svg", function(){
	return gulp.src(PATH.IMG.SPRITE.SVG.SRC)
					.pipe(svgmin({
						js2svg: {
							pretty: true
						}
					}))
					.pipe(svgSprite({
							mode: "symbols",
							preview: false,
							selector: "icon-%f",
							svg: {
								symbols: PATH.IMG.SPRITE.SVG.OUTPUT
							}
					}))
					.pipe(gulp.dest(PATH.IMG.SPRITE.SVG.DIST))
					.pipe(browserSync.stream());
});


gulp.task("serve", function(){
	browserSync.init({
		server: "./",
		open: false,
	})

	gulp.watch(PATH.SASS.SRC, ["scss"]);
	gulp.watch(PATH.IMG.BASE.SRC, ["images:base"]);
	gulp.watch(PATH.IMG.SPRITE.PNG.SRC, ["images:sprite:png"]);
	gulp.watch(PATH.IMG.SPRITE.SVG.SRC, ["images:sprite:svg"]);
	gulp.watch(PATH.HTML.SRC).on("change", browserSync.reload);
});

gulp.task("dev", ["serve"]);

gulp.task("default", [
	"scss",
	"images:base",
	"images:sprite:png",
	"images:sprite:svg",
]);

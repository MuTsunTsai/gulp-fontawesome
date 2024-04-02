
# gulp-fontawesome

> Create a minified FontAwesome package.

`gulp-fontawesome` is a [Gulp](https://gulpjs.com/) wrapper for [fontawesome-subset](https://www.npmjs.com/package/fontawesome-subset).
It collects usages of FontAwesome icons in your pages and generates the CSS and font files containing only the used icons, improving loading performance of your pages.

## Install

```
npm install --save-dev gulp-fontawesome
```

You must also install `@fortawesome/fontawesome-free` or `@fortawesome/fontawesome-pro` separately.
Supports version 6.0+.

## Example

```js
const gulp = require('gulp');
const fontawesome = require('gulp-fontawesome');

gulp.task('fontawesome', () =>
	gulp.src('src/**/*.html')   // files for collecting FontAwesome usages
		.pipe(fontawesome())    // or `fontawesome("pro")` for pro version
		.pipe(gulp.dest('...')) // generates CSS and fonts
);

```

Pay attention that usages are identified by the regular expression

```js
/\bfa([srb]|-solid|-regular|-brands)\s+fa-([a-z0-9-]*[a-z0-9])\b/g
```

and must be exactly in this order. For example, `fas fa-fw fa-wrench` will lead to the false identification of "fw" as a usage, and you should write it as `fas fa-wrench fa-fw` instead so that "wrench" is correctly identified.

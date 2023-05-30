
# gulp-fontawesome

> Create a minified FontAwesome package.

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

Pay attention that usages are identified by the format
`/fa([srb]|-solid|-regular|-brands) fa-([a-z-]+[a-z])/`,
and must be exactly in this order.

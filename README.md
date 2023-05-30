
# gulp-fontawesome

> Create a minified FontAwesome package.

## Install

```
npm install --save-dev gulp-fontawesome
```

## Example

```js
const gulp = require('gulp');
const fontawesome = require('gulp-fontawesome');

gulp.task('fontawesome', () =>
	gulp.src('src/**/*.html') // files for collecting FontAwesome usages
		.pipe(fontawesome())
		.pipe(gulp.dest('...'))
);

```

Pay attention that usages are identified by the format
`/fa([srb]|-solid|-regular|-brand) fa-([a-z-]+[a-z])/`,
and must be exactly in this order.

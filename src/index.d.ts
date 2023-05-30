import stream = require('stream');

/**
 * Create a minified FontAwesome package.
 * @param packageType Using `free` or `pro` version. Default value is `free`.
 */
declare function fontawesome(packageType: "free" | "pro" = "free"): stream.Transform;

export = fontawesome;

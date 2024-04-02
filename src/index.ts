import fs from "fs";
import os from "os";
import path from "path";
import through2 from "gulp-through2";
import { fontawesomeSubset } from "fontawesome-subset";
import { PurgeCSS } from "purgecss";

import type { PackageType } from "fontawesome-subset/dist/types";
import type { RawContent } from "purgecss";

const matcher = /\bfa([srb]|-solid|-regular|-brands)\s+fa-([a-z0-9-]*[a-z0-9])\b/g;

export = (packageType: PackageType = "free") => {
	const sets = {
		regular: new Set<string>(),
		solid: new Set<string>(),
		brands: new Set<string>(),
	};
	const raws: RawContent[] = [];
	return through2({
		name: "fontawesome",
		transform(content, file) {
			raws.push({
				raw: content,
				extension: file.extname.replace(/^\./, ""),
			});
			const matches = content.matchAll(matcher);
			for(const match of matches) {
				const type = match[1];
				if(type == "s" || type == "-solid") sets.solid.add(match[2]);
				else if(type == "b" || type == "-brands") sets.brands.add(match[2]);
				else sets.regular.add(match[2]);
			}
		},
		async flush(files) {
			if(!files.length) return;

			const result: typeof files = [];
			function add(content: Buffer, filePath: string) {
				const file = files[0].clone({ contents: false });
				file.path = path.resolve(file.base, filePath);
				file.contents = content;
				result.push(file);
			}

			// Generate purged CSS
			const fontawesome = require.resolve(`@fortawesome/fontawesome-${packageType}`);
			const location = path.resolve(fontawesome, "../../css/all.min.css");
			const source = fs.readFileSync(location);
			const cssResults = await new PurgeCSS().purge({
				content: raws,
				css: [{ raw: source.toString("utf8") }],
				keyframes: true,
				fontFace: true,
			});
			let css = cssResults[0].css;
			// For unknown reason, sometimes the font face is not kept. Fix this manually.
			if(sets.regular.size && !css.includes("fa-regular-400.woff2")) {
				css += `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:block;src:url(../webfonts/fa-regular-400.woff2) format("woff2"),url(../webfonts/fa-regular-400.ttf) format("truetype")}`;
			}
			if(sets.solid.size && !css.includes("fa-solid-900.woff2")) {
				css += `@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:block;src:url(../webfonts/fa-solid-900.woff2) format("woff2"),url(../webfonts/fa-solid-900.ttf) format("truetype")}`;
			}
			if(sets.brands.size && !css.includes("fa-brands-400.woff2")) {
				css += `@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:block;src:url(../webfonts/fa-brands-400.woff2) format("woff2"),url(../webfonts/fa-brands-400.ttf) format("truetype")}`
			}
			add(Buffer.from(css, "utf8"), "css/all.min.css");

			// Generate subset fonts
			const subset = {
				regular: [...sets.regular],
				solid: [...sets.solid],
				brands: [...sets.brands],
			};
			const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fa-"));
			await fontawesomeSubset(subset, temp, { package: packageType });
			for(const filename of fs.readdirSync(temp)) {
				const filePath = path.join(temp, filename);
				add(fs.readFileSync(filePath), "webfonts/" + filename);
				fs.rmSync(filePath);
			}
			fs.rmdirSync(temp);

			return result;
		},
	});
};

import fs from "fs";
import os from "os";
import path from "path";
import through2 from "gulp-through2";
import { fontawesomeSubset } from "fontawesome-subset";
import { PurgeCSS } from "purgecss";

import type { PackageType } from "fontawesome-subset/dist/types";
import type { RawContent } from "purgecss";

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
			const matches = content.matchAll(/fa([srb]|-solid|-regular|-brand) fa-([a-z-]+[a-z])/g);
			for(const match of matches) {
				const type = match[1];
				if(type == "s" || type == "-solid") sets.solid.add(match[2]);
				else if(type == "b" || type == "-brand") sets.brands.add(match[2]);
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
			const css = cssResults[0].css;
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

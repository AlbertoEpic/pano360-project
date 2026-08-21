const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted-products.json'), 'utf8'));

function stripHtml(html) {
	return html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\r\n/g, '\n')
		.replace(/\n{2,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();
}

function findExt(dir, slug) {
	const files = fs.readdirSync(dir);
	const found = files.find((f) => f.startsWith(`${slug}.`));
	return found ? found.split('.').pop() : 'jpg';
}

const productsDir = path.join(__dirname, '..', 'public', 'products');
const panoramasDir = path.join(__dirname, '..', 'public', 'panoramas');

const out = products.map((p) => ({
	slug: p.slug,
	title: p.title,
	category: p.categories[0] || 'Sin categoría',
	excerpt: stripHtml(p.excerpt).slice(0, 220),
	description: stripHtml(p.description),
	date: p.date.split(' ')[0],
	image: `/products/${p.slug}.${findExt(productsDir, p.slug)}`,
	panorama: `/panoramas/${p.slug}.${findExt(panoramasDir, p.slug)}`,
}));

fs.writeFileSync(path.join(__dirname, 'products-clean.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('OK', out.length);

const productsJsPath = path.join(__dirname, '..', 'src', 'data', 'products.js');
fs.writeFileSync(
	productsJsPath,
	`export const productData = ${JSON.stringify(out, null, 2)};\n`,
	'utf8'
);
console.log('Generado', productsJsPath);

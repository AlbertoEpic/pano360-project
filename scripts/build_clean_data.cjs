const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted-products.json'), 'utf8'));
const summerGuegas = products.find((product) => product.slug === 'tres-guegas-2-303m');
const additionalProducts = summerGuegas
	? [
		{
			...summerGuegas,
			slug: 'tres-guegas-2-303m-verano',
			title: 'Tres Güegas (2.303m) - verano',
			date: '2026-09-22 08:23:00',
			excerpt: 'Vista estival del Pico de las Tres Güegas.',
			description:
				'Martes, 22 de septiembre de 2026, a las 8:23am. Un sereno amanecer en la cima de este pico, después de subir en e-bike desde el parking de Sextas de Formigal.\n\nPuedes ver el aspecto de este lugar en pleno invierno.',
		},
	]
	: [];

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

function localAsset(dir, folder, slug, fallback) {
	const files = fs.readdirSync(dir);
	const found = files.find((f) => f.startsWith(`${slug}.`));
	return found ? `/${folder}/${found}` : fallback;
}

const productsDir = path.join(__dirname, '..', 'public', 'products');
const panoramasDir = path.join(__dirname, '..', 'public', 'panoramas');

const out = [...products, ...additionalProducts].map((p) => ({
	slug: p.slug,
	title: p.title,
	category: p.categories.join(', ') || 'Sin categoría',
	excerpt: stripHtml(p.excerpt).slice(0, 220),
	description: stripHtml(p.description),
	date: p.date.split(' ')[0],
	image: localAsset(productsDir, 'products', p.slug, p.thumbnailUrl),
	panorama: localAsset(panoramasDir, 'panoramas', p.slug, p.panoramaUrl),
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

// Extrae todos los productos WooCommerce (por fecha) desde el dump XML de phpMyAdmin.
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Resuelve enlaces acortados (cutt.ly, etc.) siguiendo redirecciones hasta encontrar
// el parámetro panorama= del visor Pannellum en la cabecera Location.
function resolvePanoramaUrl(url, depth = 0) {
	return new Promise((resolve) => {
		if (!url || depth > 5) return resolve(null);
		const client = url.startsWith('https') ? https : http;
		client
			.get(url, { timeout: 10000 }, (res) => {
				res.resume();
				const location = res.headers.location;
				if (location) {
					const match = location.match(/panorama=([^&]+)/);
					if (match) return resolve(decodeURIComponent(match[1]));
					return resolve(resolvePanoramaUrl(location, depth + 1));
				}
				resolve(null);
			})
			.on('timeout', function () {
				this.destroy();
				resolve(null);
			})
			.on('error', () => resolve(null));
	});
}

const XML_PATH = 'C:\\Users\\USER\\Downloads\\DB_pano360.xml';
const OUT_PATH = path.join(__dirname, 'extracted-products.json');

const xml = fs.readFileSync(XML_PATH, 'utf8');

function decodeEntities(str) {
	if (str == null) return '';
	return str
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&amp;/g, '&');
}

// Extrae todos los bloques <table name="X">...</table> (solo de datos, no de esquema pma:table)
function extractRows(tableName) {
	const rows = [];
	const re = new RegExp(`<table name="${tableName}">([\\s\\S]*?)</table>`, 'g');
	let match;
	while ((match = re.exec(xml)) !== null) {
		const body = match[1];
		const row = {};
		const colRe = /<column name="([^"]+)">([\s\S]*?)<\/column>/g;
		let colMatch;
		while ((colMatch = colRe.exec(body)) !== null) {
			row[colMatch[1]] = decodeEntities(colMatch[2]);
		}
		rows.push(row);
	}
	return rows;
}

console.log('Leyendo wp_posts...');
const posts = extractRows('wp_posts');
console.log(`Total filas wp_posts: ${posts.length}`);

const products = posts
	.filter((p) => p.post_type === 'product' && p.post_status === 'publish')
	.sort((a, b) => new Date(a.post_date) - new Date(b.post_date));

console.log(`Productos seleccionados: ${products.length}`);

console.log('Leyendo wp_postmeta...');
const postmeta = extractRows('wp_postmeta');
console.log(`Total filas wp_postmeta: ${postmeta.length}`);

console.log('Leyendo wp_term_relationships, wp_term_taxonomy, wp_terms...');
const termRelationships = extractRows('wp_term_relationships');
const termTaxonomy = extractRows('wp_term_taxonomy');
const terms = extractRows('wp_terms');

const postsById = new Map(posts.map((p) => [p.ID, p]));
const metaByPostId = new Map();
for (const m of postmeta) {
	if (!metaByPostId.has(m.post_id)) metaByPostId.set(m.post_id, {});
	metaByPostId.get(m.post_id)[m.meta_key] = m.meta_value;
}
const termTaxonomyById = new Map(termTaxonomy.map((t) => [t.term_taxonomy_id, t]));
const termById = new Map(terms.map((t) => [t.term_id, t]));

function getCategories(postId) {
	return termRelationships
		.filter((tr) => tr.object_id === postId)
		.map((tr) => termTaxonomyById.get(tr.term_taxonomy_id))
		.filter((tt) => tt && tt.taxonomy === 'product_cat')
		.map((tt) => termById.get(tt.term_id)?.name)
		.filter(Boolean);
}

function getAttachmentUrl(attachmentId) {
	const attachment = postsById.get(attachmentId);
	if (!attachment) return null;
	return attachment.guid || null;
}

(async () => {
	const result = [];
	for (const p of products) {
		const meta = metaByPostId.get(p.ID) || {};
		const thumbnailId = meta._thumbnail_id;
		const thumbnailUrl = thumbnailId ? getAttachmentUrl(thumbnailId) : null;
		const galleryIds = (meta._product_image_gallery || '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const galleryUrls = galleryIds.map(getAttachmentUrl).filter(Boolean);

		const productUrl = meta._product_url || '';
		let panoramaUrl = null;
		const panoramaMatch = productUrl.match(/panorama=([^&]+)/);
		if (panoramaMatch) {
			panoramaUrl = decodeURIComponent(panoramaMatch[1]);
		} else if (productUrl) {
			panoramaUrl = await resolvePanoramaUrl(productUrl);
		}

		result.push({
			id: p.ID,
			slug: p.post_name,
			title: decodeEntities(p.post_title),
			description: decodeEntities(p.post_content),
			excerpt: decodeEntities(p.post_excerpt),
			date: p.post_date,
			categories: getCategories(p.ID),
			thumbnailUrl,
			galleryUrls,
			panoramaUrl,
		});
	}

	fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), 'utf8');
	console.log(`Guardado en ${OUT_PATH}`);
	console.log(`Con panorama: ${result.filter((r) => r.panoramaUrl).length} / ${result.length}`);
	for (const r of result) {
		console.log(`- [${r.id}] ${r.slug} :: ${r.title} :: img=${r.thumbnailUrl} :: gallery=${r.galleryUrls.length}`);
	}
})();

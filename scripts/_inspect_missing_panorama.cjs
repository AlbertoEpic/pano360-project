const fs = require('fs');
const path = require('path');

const XML_PATH = 'C:\\Users\\USER\\Downloads\\DB_pano360.xml';
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

const posts = extractRows('wp_posts');
const products = posts.filter((p) => p.post_type === 'product' && p.post_status === 'publish');

const postmeta = extractRows('wp_postmeta');
const metaByPostId = new Map();
for (const m of postmeta) {
	if (!metaByPostId.has(m.post_id)) metaByPostId.set(m.post_id, {});
	metaByPostId.get(m.post_id)[m.meta_key] = m.meta_value;
}

// pick one product without _product_url panorama pattern
const withoutPanorama = products.filter((p) => {
	const meta = metaByPostId.get(p.ID) || {};
	const productUrl = meta._product_url || '';
	return !/panorama=/.test(productUrl);
});

console.log('sin panorama en _product_url:', withoutPanorama.length);
const sample = withoutPanorama[withoutPanorama.length - 1];
console.log('SAMPLE post ID', sample.ID, sample.post_name);
const meta = metaByPostId.get(sample.ID) || {};
console.log('meta keys:', Object.keys(meta));
console.log('_product_url:', meta._product_url);
console.log('post_content (first 1500 chars):');
console.log(sample.post_content.slice(0, 1500));

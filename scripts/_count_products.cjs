const fs = require('fs');
const xml = fs.readFileSync('C:\\Users\\USER\\Downloads\\DB_pano360.xml', 'utf8');
const re = /<table name="wp_posts">([\s\S]*?)<\/table>/g;
let m;
let count = 0;
const statusCount = {};
while ((m = re.exec(xml)) !== null) {
	const body = m[1];
	const typeMatch = body.match(/<column name="post_type">([^<]*)<\/column>/);
	const statusMatch = body.match(/<column name="post_status">([^<]*)<\/column>/);
	if (typeMatch && typeMatch[1] === 'product') {
		count++;
		const s = statusMatch ? statusMatch[1] : 'unknown';
		statusCount[s] = (statusCount[s] || 0) + 1;
	}
}
console.log('total product rows', count);
console.log(statusCount);

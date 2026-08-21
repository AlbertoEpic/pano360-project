// Descarga las imágenes (miniatura + panorama) de todos los productos extraídos.
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted-products.json'), 'utf8'));

const productsDir = path.join(__dirname, '..', 'public', 'products');
const panoramasDir = path.join(__dirname, '..', 'public', 'panoramas');
fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(panoramasDir, { recursive: true });

function download(url, destPath, depth = 0) {
	return new Promise((resolve, reject) => {
		if (depth > 5) return reject(new Error('demasiadas redirecciones'));
		const client = url.startsWith('https') ? https : http;
		let settled = false;
		const hardTimeout = setTimeout(() => {
			if (settled) return;
			settled = true;
			req.destroy(new Error(`timeout absoluto (60s) para ${url}`));
			reject(new Error(`timeout absoluto (60s) para ${url}`));
		}, 60000);
		const finish = (fn, arg) => {
			if (settled) return;
			settled = true;
			clearTimeout(hardTimeout);
			fn(arg);
		};
		const req = client
			.get(
				url,
				{
					timeout: 20000,
					headers: {
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
					},
				},
				(res) => {
					if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
						res.resume();
						return download(res.headers.location, destPath, depth + 1).then(
							(v) => finish(resolve, v),
							(e) => finish(reject, e)
						);
					}
					if (res.statusCode !== 200) {
						res.resume();
						return finish(reject, new Error(`HTTP ${res.statusCode} para ${url}`));
					}
					const fileStream = fs.createWriteStream(destPath);
					res.pipe(fileStream);
					fileStream.on('finish', () => fileStream.close(() => finish(resolve)));
				}
			)
			.on('error', (e) => finish(reject, e));
		req.on('timeout', () => req.destroy(new Error(`timeout para ${url}`)));
	});
}

function extFromUrl(url) {
	const match = url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i);
	return match ? match[1].toLowerCase() : 'jpg';
}

(async () => {
	for (const product of products) {
		const thumbExt = extFromUrl(product.thumbnailUrl || '');
		const thumbDest = path.join(productsDir, `${product.slug}.${thumbExt}`);
		if (product.thumbnailUrl && !fs.existsSync(thumbDest)) {
			try {
				await download(product.thumbnailUrl, thumbDest);
				console.log(`OK thumbnail: ${product.slug}`);
			} catch (err) {
				fs.rmSync(thumbDest, { force: true });
				console.error(`FALLO thumbnail ${product.slug}: ${err.message}`);
			}
		}

		if (product.panoramaUrl) {
			const panoExt = extFromUrl(product.panoramaUrl);
			const panoDest = path.join(panoramasDir, `${product.slug}.${panoExt}`);
			if (fs.existsSync(panoDest)) continue;
			try {
				await download(product.panoramaUrl, panoDest);
				console.log(`OK panorama: ${product.slug}`);
			} catch (err) {
				fs.rmSync(panoDest, { force: true });
				console.error(`FALLO panorama ${product.slug}: ${err.message}`);
			}
		}
	}
})();


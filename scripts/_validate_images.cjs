const fs = require('fs');
const path = require('path');

const dirs = [
	path.join(__dirname, '..', 'public', 'products'),
	path.join(__dirname, '..', 'public', 'panoramas'),
];

for (const dir of dirs) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const full = path.join(dir, file);
		const stat = fs.statSync(full);
		if (stat.size < 5000) {
			console.log('BORRANDO (demasiado pequeño):', full, stat.size, 'bytes');
			fs.rmSync(full, { force: true });
			continue;
		}
		const fd = fs.openSync(full, 'r');
		const head = Buffer.alloc(4);
		fs.readSync(fd, head, 0, 4, 0);
		const tail = Buffer.alloc(2);
		fs.readSync(fd, tail, 0, 2, stat.size - 2);
		fs.closeSync(fd);
		const isJpeg = head[0] === 0xff && head[1] === 0xd8;
		const hasEoi = tail[0] === 0xff && tail[1] === 0xd9;
		if (!isJpeg || !hasEoi) {
			console.log('BORRANDO (JPEG incompleto o inválido):', full);
			fs.rmSync(full, { force: true });
		}
	}
}
console.log('Validación completada.');

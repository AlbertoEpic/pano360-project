import rss from '@astrojs/rss';
import { productData } from '../data/products';

export function GET(context) {
	const site = context.site ?? new URL('https://pano360.soloquedalopeor.com');

	return rss({
		title: 'PANO360 | Nuevas panorámicas',
		description: 'Nuevas fotografías esféricas 360º de PANO360.',
		site,
		items: [...productData]
			.sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
			.map((product) => ({
				title: product.title,
				pubDate: new Date(product.date),
				description: product.excerpt,
				link: new URL(`/productos/${product.slug}/`, site).href,
			})),
		customData: '<language>es</language>',
	});
}
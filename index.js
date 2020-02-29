const request = require('request-promise-native');

const {evaluate} = require('./evaluate');

const incapsulaLinkRegex = /"(\/_Incapsula_Resource.+?)"/;

async function getSite(uri) {
	uri = uri.endsWith('/') ? uri : uri + '/';

	const {body: incapsulaBody, headers: {'set-cookie': setCookies}} = await request({
		uri,
		resolveWithFullResponse: true
	});

	const initialCookies = setCookies.map(e => e.split(';')[0]).join(';');
	const incapsulaLink = incapsulaLinkRegex.exec(incapsulaBody)[1];

	if (incapsulaLink)
		return handleIncapsula(uri, incapsulaLink, initialCookies);
	return incapsulaBody;
}

async function handleIncapsula(uri, incapsulaLink, initialCookies) {
	const baseUri = uri.split('/').slice(0, 3).join('/');

	const code = await request({
		headers: {
			'Cookie': initialCookies,
			'Accept': '*/*',
			'Referer': baseUri + '/'
		},
		uri: baseUri + incapsulaLink
	});

	const {cookies, imageSrc, userAgent} = await evaluate(code, initialCookies);

	const res = await request({
		headers: {
			'Cookie': cookies,
			'User-Agent': userAgent,
			'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
			'Referer': baseUri + '/'
		},
		uri: baseUri + imageSrc,
		resolveWithFullResponse: true
	});

	const body = await request({
		headers: {
			'Cookie': cookies,
			'User-Agent': userAgent,
			'Referer': baseUri + '/'
		},
		uri
	});

	if (incapsulaLinkRegex.test(body))
		return handleIncapsula(uri, incapsulaLinkRegex.exec(body)[1], initialCookies);
	return body;
}

getSite('https://funimation.com').then(console.log);
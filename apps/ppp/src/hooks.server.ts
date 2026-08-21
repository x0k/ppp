import type { Handle } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { sequence } from '@sveltejs/kit/hooks';

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		// Kit 3 made RequestEvent.request read-only, but paraglide's middleware
		// is built around replacing it.
		(event as { request: Request }).request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale).replace('%dir%', getTextDirection(locale));
			}
		});
	});

const headersHandle: Handle = ({ event, resolve }) => {
	const { setHeaders } = event;
	setHeaders({
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin'
	});
	return resolve(event);
};

export const handle: Handle = sequence(paraglideHandle, headersHandle);

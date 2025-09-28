import 'webextension-polyfill';
import 'construct-style-sheets-polyfill';
import { XApp } from './x.com';
import { InstagramApp } from './instagram.com';
import App from './hellooo.cards';

/**
 *
 */
if (document.location.host.match(/^(x\.com|twitter\.com)$/)) {
	const app = new XApp();
} else if (document.location.host.match(/^(www\.)?instagram\.com$/)) {
	const app = new InstagramApp();
} else {
	const app = new App();
}

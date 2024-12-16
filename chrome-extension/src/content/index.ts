import 'webextension-polyfill';
import 'construct-style-sheets-polyfill';
import { XApp } from './x.com';
import App from './hellooo.cards';

/**
 *
 */
if (document.location.host.match(/^(x\.com|twitter\.com)$/)) {
	const app = new XApp();
} else {
	const app = new App();
}

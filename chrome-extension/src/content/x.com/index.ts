import 'webextension-polyfill';
import 'construct-style-sheets-polyfill';

/**
 * Xのページからアイコン画像を取得する
 */
export class XApp {
	startedOn: number;

	constructor() {
		// console.log('XApp');
		this.startedOn = Date.now();
		this.check();
	}

	check = () => {
		// href属性が/photoで終わるa要素のimg要素を取得
		const img = document.querySelector('a[href$="/photo"] img') as HTMLImageElement;
		// URLからアカウント名取得
		const account = document.location.pathname.split('/')[1];
		if (img) {
			// console.log('iconUrl:', img.src);
			chrome.runtime.sendMessage({ iconUrl: img.src, account });
		} else {
			if (Date.now() - this.startedOn < 5000) {
				window.requestAnimationFrame(this.check);
			} else {
				// console.warn('Icon not found');
				chrome.runtime.sendMessage({ iconUrl: '', account });
			}
		}
	};
}

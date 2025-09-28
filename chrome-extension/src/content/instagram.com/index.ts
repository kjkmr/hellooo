import 'webextension-polyfill';
import 'construct-style-sheets-polyfill';

/**
 * Instagramのページからアイコン画像を取得する
 */
export class InstagramApp {
	startedOn: number;

	constructor() {
		this.startedOn = Date.now();
		this.check();
	}

	check = () => {
		// URLからアカウント名取得
		const account = document.location.pathname.split('/')[1];
		console.log(account);

		if (!account) {
			chrome.runtime.sendMessage({ iconUrl: '', account });
			return;
		}

		let img = document.querySelector('header a>img[alt*="profile"]') as HTMLImageElement;
		if (!img) img = document.querySelector('header a>img[alt*="プロフィール"]') as HTMLImageElement;
		if (!img) img = document.querySelector('header button>img[alt*="profile"]') as HTMLImageElement;
		if (!img)
			img = document.querySelector('header button>img[alt*="プロフィール"]') as HTMLImageElement;
		if (!img) img = document.querySelector('header button>img') as HTMLImageElement;
		if (!img)
			img = document.querySelector('header img[crossorigin="anonymous"]') as HTMLImageElement;

		console.log(img);
		if (img) {
			console.log('iconUrl:', img.src);
			chrome.runtime.sendMessage({ iconUrl: img.src, account });
		} else {
			if (Date.now() - this.startedOn < 5000) {
				window.requestAnimationFrame(this.check);
			} else {
				console.warn('Icon not found');
				chrome.runtime.sendMessage({ iconUrl: '', account });
			}
		}
	};
}

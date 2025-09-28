import { getImageAsBase64 } from './utils';

/**
 * getInstagramIcons
 * @param accounts
 * @returns iconUrls
 */
export async function getInstagramIcons(accounts: string[]) {
	const icons: {
		account: string;
		url: string;
		data: string;
		platform: 'instagram';
	}[] = [];

	for (let i = 0; i < accounts.length; i++) {
		const account = accounts[i];
		// @のみの場合は空シールとして扱う
		if (account === '@') {
			icons.push({
				account: '',
				url: '',
				data: '',
				platform: 'instagram',
			});
			continue;
		}
		// タブを開く
		const tab = await new Promise<chrome.tabs.Tab>((resolve) =>
			chrome.tabs.create({ url: `https://instagram.com/${account}` }, (tab) => resolve(tab))
		);
		// タブの読み込みを待ってアイコンを取得
		const url = await new Promise<string>((resolve) => {
			const onComplete = (message: any) => {
				if (message.account == account && message.iconUrl !== undefined) {
					chrome.runtime.onMessage.removeListener(onComplete);
					resolve(message.iconUrl);
				}
			};
			chrome.runtime.onMessage.addListener(onComplete);
			// 6秒経っても取得できなかった場合は空文字を返す
			setTimeout(() => {
				chrome.runtime.onMessage.removeListener(onComplete);
				resolve('');
			}, 6000);
		});
		icons.push({
			account,
			url,
			data: url ? await getImageAsBase64(url) : '',
			platform: 'instagram',
		});
		chrome.tabs.remove(tab.id as number);
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return icons;
}
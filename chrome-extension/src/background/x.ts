/**
 * getImageAsBase64
 * @param url
 */
export function getImageAsBase64(url: string): Promise<string> {
	return new Promise<string>(resolve => {
		fetch(url)
			.then(response => response.blob())
			.then(blob => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result as string);
				};
				reader.readAsDataURL(blob);
			});
	});
};


/**
 * getXIcons
 * @param accounts
 * @returns iconUrls
 */
export async function getXIcons(accounts: string[]) {
	const icons: {
		account: string;
		url: string;
		data: string;
	}[] = [];
	for (let i = 0; i < accounts.length; i++) {
		const account = accounts[i];
		// タブを開く
		chrome.storage.local.clear();
		const tab = await new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.create({ url: `https://x.com/${account}` }, tab => resolve(tab)));
		// タブの読み込みを待ってアイコンを取得
		const url = await new Promise<string>(async resolve => {
			const onComplete = (message: any) => {
				if (message.account == account && message.iconUrl !== undefined) {
					chrome.runtime.onMessage.removeListener(onComplete);
					resolve(message.iconUrl);
				}
			};
			chrome.runtime.onMessage.addListener(onComplete);
		});
		icons.push({
			account,
			url,
			data: url ? await getImageAsBase64(url) : ''
		});
		chrome.tabs.remove(tab.id as number);
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	return icons;
};

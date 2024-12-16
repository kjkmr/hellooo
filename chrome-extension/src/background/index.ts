import browser from 'webextension-polyfill';
import { getXIcons } from './x';

// 初回インストール時の挙動
browser.runtime.onInstalled.addListener(async (details) => {
	if (details.reason === 'install') {
		await browser.tabs.create({ url: 'https://hellooo.cards/?status=installed' });
	}
});

// アイコンをクリックしたらページを開く
chrome.action.onClicked.addListener(async (tab) => {
	console.log("Hello")
	await browser.tabs.create({ url: 'https://hellooo.cards' });
});


/**
 * contentスクリプトからのメッセージ受信
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.accounts) {
		const accounts = message.accounts as string[];
		const sessionId = Math.random().toString(36).slice(-8);
		sendResponse({ sessionId });
		// save current tab
		const mainTab = await new Promise<chrome.tabs.Tab>(resolve => {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]))
		});
		const icons = await getXIcons(accounts);
		chrome.tabs.sendMessage(mainTab.id as number, { sessionId, icons }, function(response) {});
		chrome.tabs.update(mainTab.id as number, {selected: true});
	} else {
		sendResponse({
			'status': false,
			'reason': 'message is missing'
		});
	}
	return true;
});
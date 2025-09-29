import { jsPDF } from 'jspdf';
import QRious from 'qrious';
import { Icon, LabelTemplate } from '../../../../common/_interface';

export default class Pdf {
	#qr: QRious;
	constructor() {
		this.#qr = new QRious({ size: 640 });
	}

	/**
	 * createPdf
	 * @param icons
	 */
	async create(icons: Icon[], template: LabelTemplate, field1Text: string, field2Text: string) {
		const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
		const numCardsPerPage = template.page.numCardsX * template.page.numCardsY;
		for (let i = 0; i < icons.length / numCardsPerPage; i++) {
			if (i > 0) doc.addPage();
			await this.#createPage(
				doc,
				icons.slice(i * numCardsPerPage, (i + 1) * numCardsPerPage),
				template,
				field1Text,
				field2Text
			);
		}
		doc.save('hellooo.pdf');
	}

	/**
	 * createPage
	 * @param doc
	 * @param icons
	 */
	async #createPage(
		doc: jsPDF,
		icons: Icon[],
		template: LabelTemplate,
		field1Text: string,
		field2Text: string
	) {
		for (let i = 0; i < icons.length; i++) {
			await this.#createCard(doc, icons[i], i, template, field1Text, field2Text);
		}
	}

	/**
	 * createCard
	 * @param doc
	 * @param icon
	 * @param index
	 */
	async #createCard(
		doc: jsPDF,
		icon: Icon,
		index: number,
		template: LabelTemplate,
		field1Text: string,
		field2Text: string
	) {
		doc.setFontSize(12);
		const account = icon.account;
		const numColumns = template.page.numCardsX;
		const x =
			template.page.marginLeft +
			(index % numColumns) * (template.card.width + template.card.offsetX);
		const y =
			template.page.marginTop +
			Math.floor(index / numColumns) * (template.card.height + template.card.offsetY);
		// for test
		// doc.line(x, y, x + CARD_WIDTH, y);
		// doc.line(x, y + CARD_HEIGHT, x + CARD_WIDTH, y + CARD_HEIGHT);

		const paddingLeft = template.card.paddingLeft || 4;
		const paddingTop = template.card.paddingTop || 4;
		const iconMarginBottom = template.card.iconMarginBottom || 3;
		const textHeight = template.card.textHeight || 15;

		// image
		if (icon.data) {
			const format = this.#getImageFormat(icon);
			const iconData = icon.data;
			doc.addImage(
				iconData,
				format,
				x + paddingLeft,
				y + paddingTop,
				template.card.iconSize,
				template.card.iconSize
			);
		}
		// qr
		if (account) {
			const qrUrl = icon.platform === 'instagram'
				? `https://instagram.com/${account}`
				: `https://x.com/${account}`;
			this.#qr.set({ value: qrUrl });
			const qr = this.#qr.toDataURL('image/png');
			icon.qr = qr;
			doc.addImage(
				qr,
				'image/png',
				x + paddingLeft,
				y + template.card.iconSize + paddingTop + iconMarginBottom,
				template.card.qrSize,
				template.card.qrSize
			);
		}
		// text
		const marginLeft = account
			? paddingLeft + template.card.iconSize + (template.card.iconMarginRight || 6)
			: paddingLeft;

		const marginTop = paddingTop + 2;
		doc.setFontSize(5);
		const platformLabel = icon.platform === 'instagram' ? 'Instagram:' : 'X (Twitter):';
		doc.text(platformLabel, x + marginLeft, y + 0 + marginTop);
		doc.text(field1Text + ':', x + marginLeft, y + textHeight + marginTop);
		doc.text(field2Text + ':', x + marginLeft, y + textHeight * 2 + marginTop);
		if (account) {
			doc.setFontSize(12);
			doc.text('@' + account, x + marginLeft, y + 6 + marginTop);
			// self.drawString((10 + template.card.iconSize) * mm, (CARD_HEIGHT - 6.5) * mm, '@' + account, 12)
		}
	}

	#getImageFormat(icon: Icon) {
		if (icon.url.match(/\.png$/i)) return 'PNG';
		if (icon.url.match(/\.jpe?g$/i)) return 'JPEG';
		if (icon.url.match(/\.gif$/i)) return 'GIF';
		return 'JPEG';
	}
}

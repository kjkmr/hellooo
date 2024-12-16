import { jsPDF } from 'jspdf';
//@ts-ignore
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
	async create(icons: Icon[], template: LabelTemplate) {
		const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
		const numCardsPerPage = template.page.numCardsX * template.page.numCardsY;
		for (let i = 0; i < icons.length / numCardsPerPage; i++) {
			if (i > 0) doc.addPage();
			await this.#createPage(
				doc,
				icons.slice(i * numCardsPerPage, (i + 1) * numCardsPerPage),
				template
			);
		}
		doc.save('hellooo.pdf');
	}

	/**
	 * createPage
	 * @param doc
	 * @param icons
	 */
	async #createPage(doc: jsPDF, icons: Icon[], template: LabelTemplate) {
		for (let i = 0; i < icons.length; i++) {
			await this.#createCard(doc, icons[i], i, template);
		}
	}

	/**
	 * createCard
	 * @param doc
	 * @param icon
	 * @param index
	 */
	async #createCard(doc: jsPDF, icon: Icon, index: number, template: LabelTemplate) {
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

		// image
		const format = this.#getImageFormat(icon);
		const iconData = icon.data;
		doc.addImage(iconData, format, x + 4, y + 4, template.card.iconSize, template.card.iconSize);
		// qr
		this.#qr.set({ value: `https://x.com/${account}` });
		const qr = this.#qr.toDataURL('image/png');
		icon.qr = qr;
		doc.addImage(
			qr,
			'image/png',
			x + 4,
			y + template.card.iconSize + 4 + 3,
			template.card.qrSize,
			template.card.qrSize
		);
		// text
		const marginLeft = template.card.iconSize + 10;
		const marginTop = 6;
		doc.setFontSize(5);
		doc.text('X (Twitter):', x + marginLeft, y + 0 + marginTop);
		doc.text('Company:', x + marginLeft, y + 15 + marginTop);
		doc.text('Name:', x + marginLeft, y + 30 + marginTop);
		doc.setFontSize(12);
		doc.text('@' + account, x + marginLeft, y + 6 + marginTop);
		// self.drawString((10 + template.card.iconSize) * mm, (CARD_HEIGHT - 6.5) * mm, '@' + account, 12)
	}

	#getImageFormat(icon: Icon) {
		if (icon.url.match(/\.png$/i)) return 'PNG';
		if (icon.url.match(/\.jpe?g$/i)) return 'JPEG';
		if (icon.url.match(/\.gif$/i)) return 'GIF';
		return 'JPEG';
	}
}

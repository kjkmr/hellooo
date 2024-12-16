export interface Icon {
	account: string
	data: string
	url: string
	qr?: string
}

export interface LabelTemplate {
	id: string
	url: string
	modelNumber: string
	maker: string
	amazonUrl: string
	iconImage: string
	page: {
		width: number
		height: number
		marginTop: number
		marginLeft: number
		numCardsX: number
		numCardsY: number
	}
	card: {
		width: number
		height: number
		iconSize: number
		qrSize: number
		offsetX: number
		offsetY: number
	}
}

export interface Icon {
	account: string
	data: string
	url: string
	qr?: string
	platform?: 'x' | 'instagram'
}

export interface IconWithSpriteSheet {
	account: string
	url: string
	dataPath?: string
	qrPath?: string
	platform?: 'x' | 'instagram'
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
		paddingLeft?: number // default: 4
		paddingTop?: number // default: 4
		iconMarginBottom?: number // default: 3
		iconMarginRight?: number // default: 6
		textHeight?: number // default: 15
	}
}

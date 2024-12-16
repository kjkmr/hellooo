import { LabelTemplate } from './_interface'
import { kokuyo_KPC_E1121_20N } from './kokuyo-KPC-E1121-20N'
import { kokuyo_KPC_U10_20 } from './kokuyo-KPC-U10-20'
import { a_one_29221 } from './a-one-29221'
import { a_one_31514 } from './a-one-31514'
import { a_one_72110 } from './a-one-72110'
import { a_one_75210 } from './a-one-75210'

class _Templates extends Array<LabelTemplate> {
	constructor(...args: LabelTemplate[]) {
		super(...args)
	}
	getById(id: string): LabelTemplate | undefined {
		return this.find((template) => template.id === id)
	}
}
export const Templates: _Templates = new _Templates(
	kokuyo_KPC_U10_20,
	kokuyo_KPC_E1121_20N,
	a_one_29221,
	a_one_31514,
	a_one_72110,
	a_one_75210
)

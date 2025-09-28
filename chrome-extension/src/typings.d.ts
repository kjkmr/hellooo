/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="chrome"/>
/// <reference types="vite/client" />

declare module 'qrious' {
	export default class QRious {
		constructor(options?: { value?: string; size?: number });
		set(options: { value?: string; size?: number }): void;
		toDataURL(type?: string): string;
		value?: string;
		size?: number;
	}
}

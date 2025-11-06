/**
 * Google Analytics イベント送信ユーティリティ
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

/**
 * GAイベントを送信する基本関数
 */
const sendEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * 機能拡張のインストール有無を送信
 */
export const trackExtensionCheck = (isInstalled: boolean) => {
  sendEvent('extension_check', {
    is_installed: isInstalled,
  });
};

/**
 * 用紙選択イベントを送信
 */
export const trackTemplateSelected = (
  templateId: string,
  maker: string,
  modelNumber: string
) => {
  sendEvent('template_selected', {
    template_id: templateId,
    maker,
    model_number: modelNumber,
  });
};

/**
 * カード作成開始イベントを送信
 */
export const trackCardCreationStarted = (params: {
  templateId: string;
  platform: string;
  accountCount: number;
  hasCustomFields: boolean;
}) => {
  sendEvent('card_creation_started', {
    template_id: params.templateId,
    platform: params.platform,
    account_count: params.accountCount,
    has_custom_fields: params.hasCustomFields,
  });
};

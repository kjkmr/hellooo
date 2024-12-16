"use client";

import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import TemplateList from "./templateList";
import "@/styles/_modal.scss";

interface ModalProps {
  isOpen: boolean;
  accountText: string;
  setAccountText: (text: string) => void;
  step: number;
  setStep: (step: number) => void;
  onClose?: () => void;
}

export default function Modal(props: ModalProps) {
  const { isOpen, accountText, setAccountText, onClose, step, setStep } = props;
  const [templateId, setTemplateId] = useState<string | null>("");
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ステップ3の時にテキストエリアにフォーカス
  useEffect(() => {
    if (step == 3 && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen, step]);

  // インストール済みの場合はステップ2に進む
  useEffect(() => {
    // 拡張機能がインストールされているかチェック
    const checkIsExtensionInstalled = () => {
      return window.document.documentElement.classList.contains(
        "hellooo-installed",
      );
    };
    setIsExtensionInstalled(checkIsExtensionInstalled());

    window.postMessage({
      type: isOpen ? "modalOpen" : "modalClose",
      selectedTemplateId: templateId,
    });
    if (checkIsExtensionInstalled() && step == 1) setStep(2);
  }, [isOpen]);

  // テキストエリアの設定
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.addEventListener("focus", () => {
      if (!textareaRef.current) return;
      // テキストエリアの内容を全選択
      textareaRef.current.select();
    });
  }, [textareaRef.current]);

  /**
   * テキストエリアの内容が変更された時
   */
  const onTextAreaChange = (event: SyntheticEvent) => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    setAccountText(text);
  };

  /**
   * 作成ボタンクリック時
   */
  const handleCreate = () => {
    if (!isExtensionInstalled) {
      alert("Chrome拡張機能がインストールされていません。");
      setStep(1);
      return;
    }
    if (!templateId) {
      alert("用紙を選択してください。");
      setStep(2);
      return;
    }
    window.postMessage({
      type: "create",
      accounts: accountText.split("\n"),
      selectedTemplateId: templateId,
    });
  };

  /**
   *
   * @param id
   */
  const handleSelectTemplate = (id: string | null) => {
    setTemplateId(id);
  };

  /**
   * テンプレートの決定ボタンクリック時
   */
  const handleSetTemplate = () => {
    setStep(3);
  };

  /**
   * Step1
   */
  const step1 = () => {
    return (
      <div className="modal__step1">
        <a href="" target="_blank">
          <img src="/images/extension-icon.svg" width="120" height="120" />
        </a>
        {isExtensionInstalled ? (
          <p className="modal__text">Chrome拡張機能はインストール済みです。</p>
        ) : (
          <p className="modal__text">
            Hellooo!をご利用いただくには、
            Xのアイコン画像取得のためのChrome拡張機能が必要です。
            <br />
            <a href="" target="_blank" className="modal__link">
              こちら
            </a>
            からインストールしてください。
          </p>
        )}
      </div>
    );
  };

  /**
   * Step2
   */
  const step2 = () => {
    return (
      <div className="modal__step2">
        <p className="modal__text">
          印刷するシール用紙を選択してください。
          <br />
          （選択肢にないものは未対応です）
        </p>
        <div className="modal__step2__list">
          <TemplateList
            onSelect={handleSelectTemplate}
            templateId={templateId}
          />
          <button className="modal__button" onClick={handleSetTemplate}>
            決定
          </button>
        </div>
      </div>
    );
  };

  /**
   * Step3
   */
  const step3 = () => {
    return (
      <div className="modal__step3">
        <textarea
          ref={textareaRef}
          onChange={onTextAreaChange}
          value={accountText}
        />
        <div>
          <p className="modal__text">
            シールを作成するアカウントのリスト（1行に1アカウント）を入力するか、テキストファイルをドラッグ&ドロップしてください。
          </p>
          <button className="modal__button" onClick={handleCreate}>
            作成開始！
          </button>
        </div>
      </div>
    );
  };

  /**
   * Tab
   */
  const stepNav = () => {
    return (
      <nav className="modal__nav">
        <ul>
          <li
            className={`modal__navItem ${step === 1 ? "active" : ""} ${isExtensionInstalled ? "done" : ""}`}
          >
            <a onClick={() => setStep(1)}>
              <span>1</span>
              拡張機能
            </a>
          </li>
          <li
            className={`modal__navItem ${step === 2 ? "active" : ""} ${templateId ? "done" : ""}`}
          >
            <a onClick={() => setStep(2)}>
              <span>2</span>
              用紙選択
            </a>
          </li>
          <li className={`modal__navItem ${step === 3 ? "active" : ""}`}>
            <a onClick={() => setStep(3)}>
              <span>3</span>
              Xアカウント
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <div className={`modal ${isOpen ? "open" : ""}`}>
        <div className="modal__bg" onClick={onClose}></div>
        <div className="modal__wrapper">
          {stepNav()}
          <div className="modal__content">
            {step === 1 && step1()}
            {step === 2 && step2()}
            {step === 3 && step3()}
          </div>
        </div>
      </div>
    </>
  );
}

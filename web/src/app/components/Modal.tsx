"use client";

import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import TemplateList from "./templateList";
import "@/styles/_modal.scss";
import { getAccountLists } from "./utils";
import { platform } from "os";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accountText: string;
  setAccountText: (text: string) => void;
  field1Text: string;
  setField1Text: (text: string) => void;
  field2Text: string;
  setField2Text: (text: string) => void;
  step: number;
  setStep: (step: number) => void;
  onClose?: () => void;
}

export default function Modal(props: ModalProps) {
  const {
    isOpen,
    setIsOpen,
    accountText,
    setAccountText,
    field1Text,
    setField1Text,
    field2Text,
    setField2Text,
    onClose,
    step,
    setStep,
  } = props;
  const [templateId, setTemplateId] = useState<string | null>("");
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const snsSelectRef = useRef<HTMLSelectElement>(null);
  const textField1Ref = useRef<HTMLInputElement>(null);
  const textField2Ref = useRef<HTMLInputElement>(null);

  // ドラッグ&ドロップ初期化
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      dropArea.classList.add("dragover");
    };

    const onDragLeave = (event: DragEvent) => {
      dropArea.classList.remove("dragover");
    };

    const onDrop = async (event: DragEvent) => {
      dropArea.classList.remove("dragover");
      event.preventDefault();
      if (!event.dataTransfer) {
        alert(
          "Xのアカウントリストのテキストファイルをドラッグ＆ドロップしてください。",
        );
        return;
      }
      // アカウントリスト取得
      const accountLists = await getAccountLists(event.dataTransfer.items);
      setAccountText(accountLists.join("\n"));
      setStep(3);
      setIsOpen(true);
    };

    dropArea.addEventListener("drop", onDrop, false);
    dropArea.addEventListener("dragover", onDragOver, false);
    dropArea.addEventListener("dragend", onDragLeave);
    dropArea.addEventListener("dragleave", onDragLeave);
    return () => {
      dropArea.removeEventListener("drop", onDrop);
      dropArea.removeEventListener("dragover", onDragOver);
      dropArea.removeEventListener("dragend", onDragLeave);
      dropArea.removeEventListener("dragleave", onDragLeave);
    };
  }, [dropAreaRef.current]);

  // ステップ3の時にテキストエリアにフォーカス
  useEffect(() => {
    if (step == 3 && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen, step]);

  // インストール済みの場合はステップ2に進む
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") return;

    // 拡張機能がインストールされているかチェック
    const checkIsExtensionInstalled = () => {
      return window.document.documentElement.classList.contains(
        "hellooo-installed",
      );
    };

    // 少し遅延させてから実行（DOMが完全に準備された後）
    const timer = setTimeout(() => {
      setIsExtensionInstalled(checkIsExtensionInstalled());
      if (checkIsExtensionInstalled() && step == 1) setStep(2);
    }, 100);

    window.postMessage({
      type: isOpen ? "modalOpen" : "modalClose",
      selectedTemplateId: templateId,
    });

    return () => clearTimeout(timer);
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

  const onField1Change = (event: SyntheticEvent) => {
    if (!textField1Ref.current) return;
    const text = textField1Ref.current.value;
    setField1Text(text);
  };

  const onField2Change = (event: SyntheticEvent) => {
    if (!textField2Ref.current) return;
    const text = textField2Ref.current.value;
    setField2Text(text);
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

    // フィールド1、フィールド2の半角英数字チェック
    const alphanumericRegex = /^[a-zA-Z0-9\s]*$/;

    if (!alphanumericRegex.test(field1Text)) {
      alert("フィールド1は半角英数字のみで入力してください。");
      return;
    }

    if (!alphanumericRegex.test(field2Text)) {
      alert("フィールド2は半角英数字のみで入力してください。");
      return;
    }

    window.postMessage({
      type: "create",
      accounts: accountText.split("\n"),
      platform: snsSelectRef.current?.value || "x",
      field1Text,
      field2Text,
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
        <a
          href="https://chromewebstore.google.com/detail/hellooo/jicgloohkdidfojpecckocfeoaiajgkp"
          target="_blank"
        >
          <img src="/images/extension-icon.svg" width="120" height="120" />
        </a>
        {isExtensionInstalled ? (
          <p className="modal__text">Chrome拡張機能はインストール済みです。</p>
        ) : (
          <p className="modal__text">
            Hellooo!をご利用いただくには、
            Xのアイコン画像取得のためのChrome拡張機能が必要です。
            <br />
            <a
              href="https://chromewebstore.google.com/detail/hellooo/jicgloohkdidfojpecckocfeoaiajgkp"
              target="_blank"
              className="modal__link"
            >
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
        <div className="modal__step3__form">
          <textarea
            ref={textareaRef}
            onChange={onTextAreaChange}
            value={accountText}
          />
        </div>
        <div className="modal__step3__customize">
          <div>
            <label>SNS</label>
            <select ref={snsSelectRef}>
              <option value="x">X (旧Twitter)</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          <div>
            <label>フィールド 1</label>
            <input
              type="text"
              maxLength={20}
              onChange={onField1Change}
              ref={textField1Ref}
              value={field1Text}
            />
          </div>
          <div>
            <label>フィールド 2</label>
            <input
              type="text"
              maxLength={20}
              onChange={onField2Change}
              ref={textField2Ref}
              value={field2Text}
            />
          </div>
        </div>
        <div className="modal__step3__submit">
          <p className="modal__text">
            1行に1アカウントのリストを入力するか、テキストファイルをドラッグ&ドロップしてください。
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
              アカウント
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <div ref={dropAreaRef} className={`modal ${isOpen ? "open" : ""}`}>
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

"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button.tsx";
import Modal from "@/components/Modal";
import "@/styles/_base.scss";
import "@/styles/_main.scss";
import { downloadJson, isPcChrome, isSpLayout } from "./components/utils";
import { Bg } from "@/bg";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [spLayout, setSpLayout] = useState(false);
  const [pcChrome, setPcChrome] = useState(false);
  const [accountText, setAccountText] = useState<string>(
    "@kjkmr\n@a_saya_108\n@bxoxnx\n@tomonorix0805",
  );
  const [field1Text, setField1Text] = useState<string>("Company");
  const [field2Text, setField2Text] = useState<string>("Name");

  // 初期化
  useEffect(() => {
    setSpLayout(isSpLayout());
    setPcChrome(isPcChrome());
    Bg.init();
    Bg.getInstance().on("create-button-click", openModal);
    const onResize = () => {
      setSpLayout(isSpLayout());
      setPcChrome(isPcChrome());
    };
    window.addEventListener("resize", onResize);
    return () => {
      Bg.getInstance().removeAllListeners("create-button-click");
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // モーダル開閉時に背景のインタラクションを切り替え
  useEffect(() => {
    Bg.getInstance().setInteractive(!isModalOpen);
  }, [isModalOpen]);

  // window.postMessageを受け取って、モーダルを開く
  useEffect(() => {
    const onGetMessage = (event: MessageEvent) => {
      if (event.data.type == "openStep" && event.data.step === 2) {
        setIsModalOpen(true);
      } else if (event.data.type == "startGetIcons") {
        console.log("startGetIcons");
      } else if (event.data.type == "endGetIcons") {
        console.log(event.data.icons);
      } else if (event.data.type == "startCreatePdf") {
        console.log("startCreatePdf");
      } else if (event.data.type == "endCreatePdf") {
        console.log("endCreatePdf");
        setIsModalOpen(false);
        if (process.env.NODE_ENV === "development") {
          downloadJson(event.data.icons, "icons.json");
        }
        console.log(
          `Page.tsx field1Text: ${field1Text}, field2Text: ${field2Text}`,
        );
        Bg.getInstance().setIcons(
          event.data.icons,
          undefined,
          field1Text,
          field2Text,
        );
        Bg.getInstance().showThanks();
      }
    };
    if (window !== undefined) {
      window.addEventListener("message", onGetMessage);
      return () => {
        window.removeEventListener("message", onGetMessage);
      };
    }
  }, [field1Text, field2Text]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <main id="drop-area">
        <div className="main__wrapper">
          <div className="main__logo">
            <svg
              width="153"
              height="33"
              viewBox="0 0 153 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M0,24.406h3.393V5.423H0V0h14.372v5.423h-3.393v6.675h10.854v-6.675h-3.393V0h14.372v5.423h-3.393v18.983h3.393v5.423h-14.372v-5.423h3.393v-6.465h-10.854v6.465h3.393v5.423H0v-5.423Z"
                  fill="#fd5100"
                />
                <path
                  d="M45.109,7.841c6.526,0,10.176,4.424,10.176,10.386,0,.714-.169,2.172-.169,2.172h-13.866c.546,2.755,2.755,3.964,5.088,3.964,3.225,0,6.148-2.041,6.148-2.041l2.667,5.007s-3.514,3.009-9.417,3.009c-7.799,0-11.995-5.546-11.995-11.266,0-6.303,4.329-11.222,11.369-11.222v-.008ZM47.695,16.435c0-1.712-1.148-3.171-2.755-3.171-2.12,0-3.136,1.502-3.514,3.171h6.273-.004Z"
                  fill="#fd5100"
                />
                <path
                  d="M57.855,5.217h-2.968V0h10.308v21.485c0,2.041.382,2.755,2.032,2.755.47,0,.892-.044.892-.044v5.72s-1.016.123-2.209.123c-3.903,0-8.056-.92-8.056-8.134V5.217Z"
                  fill="#fd5100"
                />
                <path
                  d="M71.175,5.217h-2.968V0h10.308v21.485c0,2.041.382,2.755,2.032,2.755.47,0,.891-.044.891-.044v5.72s-1.016.123-2.209.123c-3.903,0-8.056-.92-8.056-8.134V5.217Z"
                  fill="#fd5100"
                />
                <path
                  d="M145.37,0h7.63l-.679,20.609h-6.272L145.37,0ZM145.828,23.574h6.694v6.259h-6.694v-6.259Z"
                  fill="#fd5100"
                />
                <path
                  d="M57.855,5.217h-2.968V0h10.308v21.485c0,2.041.382,2.755,2.032,2.755.47,0,.892-.044.892-.044v5.72s-1.016.123-2.209.123c-3.903,0-8.056-.92-8.056-8.134V5.217Z"
                  fill="#fd5100"
                />
              </g>
              <path
                d="M134.006,8.027h-3.23c2.124,2.04,3.43,4.903,3.43,8.126v5.549c0,3.223-1.306,6.086-3.43,8.126h3.23c4.546,0,8.232-3.638,8.232-8.126v-5.549c0-4.488-3.686-8.126-8.232-8.126Z"
                fill="#fd5100"
              />
              <path
                d="M122.761,8.027h-3.229c2.124,2.04,3.43,4.903,3.43,8.126v5.549c0,3.223-1.306,6.086-3.43,8.126h3.229c4.547,0,8.233-3.638,8.233-8.126v-5.549c0-4.488-3.686-8.126-8.233-8.126Z"
                fill="#fd5100"
              />
              <path
                d="M111.517,8.027h-20.078c-4.547,0-8.232,3.638-8.232,8.126v5.549c0,4.488,3.686,8.126,8.232,8.126h20.078c4.547,0,8.233-3.638,8.233-8.126v-5.549c0-4.488-3.686-8.126-8.233-8.126ZM91.961,20.137c-1.952,0-3.534-1.558-3.534-3.476s1.582-3.476,3.534-3.476,3.534,1.558,3.534,3.476-1.582,3.476-3.534,3.476Z"
                fill="#fd5100"
              />
            </svg>
          </div>
          {spLayout ? (
            <p className="main__sp-message">
              このサービスはPCのブラウザで
              <br />
              ご利用ください。
            </p>
          ) : !pcChrome ? (
            <p className="main__chrome-message">
              お使いのブラウザではこのサービスはご利用いただけません。
              <br />
              <a href="https://www.google.com/intl/ja/chrome/" target="_blank">
                Google Chrome
              </a>
              でご利用ください。
            </p>
          ) : (
            <></>
          )}
        </div>
      </main>
      <p className="main__credit">
        Extension Development, Frontend Development by&nbsp;
        <a href="https://x.com/kjkmr" target="_blank">
          @kjkmr
        </a>
        , Design, Frontend Development by&nbsp;
        <a href="https://x.com/WebMino" target="_blank">
          @WebMino
        </a>
        &nbsp;/ Originally made for&nbsp;
        <a href="https://x.com/casestudy_info" target="_blank">
          @casestudy_info
        </a>
        .
      </p>
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onClose={closeModal}
        step={step}
        setStep={setStep}
        accountText={accountText}
        setAccountText={setAccountText}
        field1Text={field1Text}
        setField1Text={setField1Text}
        field2Text={field2Text}
        setField2Text={setField2Text}
      />
    </>
  );
}

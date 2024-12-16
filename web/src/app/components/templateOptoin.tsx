import React from "react";
import { LabelTemplate } from "../../../../common/_interface";

type TemplateOptionProps = {
  data?: LabelTemplate;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function TemplateOption(props: TemplateOptionProps) {
  const { data, selected, onSelect } = props;

  const onClick = () => {
    onSelect(data ? data.id : "");
  };

  return (
    <li
      className={`template-list__option ${selected ? "selected" : ""}`}
      data-id={data ? data.id : ""}
      onClick={onClick}
    >
      <div className="template-list__inner">
        {data ? (
          <>
            <div className="template-list__icon">
              <img
                src={`/template-icons/${data.iconImage}`}
                width={60}
                height={60}
              />
            </div>
            <div>
              <p className="template-list__model">
                {data.maker}&nbsp;/&nbsp;
                {data.modelNumber}
              </p>
              <p className="template-list__spec">
                {data.card.width}mm x {data.card.height}mm&nbsp;&nbsp;
                {data.page.numCardsX * data.page.numCardsY}面
              </p>
              <p className="template-list__link">
                <a href={data.url} target="_blank">
                  メーカーサイト
                </a>
                &nbsp;&nbsp;
                <a href={data.amazonUrl} target="_blank">
                  Amazonで購入
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="template-list__note-selected">
              シール用紙を選択してください
            </p>
          </>
        )}
      </div>
    </li>
  );
}

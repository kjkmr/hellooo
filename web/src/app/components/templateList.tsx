import React, { useEffect, useState } from "react";
import { Templates } from "../../../../common";
import TemplateOption from "./templateOptoin";

type TemplateListProps = {
  templateId: string | null;
  onSelect: (id: string | null) => void;
};

export default function TemplateList(props: TemplateListProps) {
  // 開閉
  const [isOpen, setIsOpen] = useState(false);
  // 選択中のテンプレートID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    props.templateId || "",
  );

  // テンプレート選択時にChrome拡張機能側に通知
  useEffect(() => {
    props.onSelect(selectedTemplateId);
    // window.postMessage({ type: "selectTemplate", selectedTemplateId }, "*");
  }, [selectedTemplateId]);

  const onSelect = (id: string) => {
    if (isOpen) {
      setSelectedTemplateId(id);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <ul className={`template-list ${isOpen ? "open" : ""}`}>
      {(isOpen || selectedTemplateId == "") && (
        <TemplateOption
          selected={selectedTemplateId == ""}
          onSelect={onSelect}
        />
      )}
      {Templates.map((template, i) => {
        if (!isOpen && template.id != selectedTemplateId) {
          return null;
        }
        return (
          <TemplateOption
            key={i}
            data={template}
            selected={template.id == selectedTemplateId}
            onSelect={onSelect}
          />
        );
      })}
    </ul>
  );
}

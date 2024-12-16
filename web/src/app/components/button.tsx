import React from "react";

type ButtonProps = {
  text: string;
  onOpen?: () => void;
};

export default function Button(props: ButtonProps) {
  const { text, onOpen } = props;
  return (
    <button className="button" onClick={onOpen}>
      <p className="button__text">{text}</p>
    </button>
  );
}

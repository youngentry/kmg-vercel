import React from "react";
import { useSelector } from "react-redux";
import styled, { css } from "styled-components";

interface BlueButtonProps {
  children: any;
  inactive?: boolean;
  disabled?: boolean;
  isDarkMode?: boolean;
  onClick?: () => void;
}

const BlueButtonBox = styled.button<BlueButtonProps>`
  margin: 0 auto;
  padding: 1.7rem 3.4rem;
  display: flex;
  justify-content: center;
  text-align: center;
  width: 18.5rem;
  font-size: 1.6rem;
  font-weight: 500;
  letter-spacing: 0.05rem;
  color: #fff;
  background: var(--mainBlue);
  border-radius: 3rem;
  border: none;
  transition: 0.3s;
  cursor: pointer;

  &:hover {
    background: var(--mainBlueHover);
    color: #fff;
  }
  ${(props) =>
    props.disabled &&
    css`
      background: var(--mainGray);
      cursor: not-allowed;
      &:hover {
        background: var(--mainBlack);
      }
    `}
  ${(props) =>
    props.inactive &&
    css`
      box-sizing: border-box;
      background: var(--mainWhite);
      color: var(--mainBlue);
      box-shadow: ${props.isDarkMode ? "none" : "inset 0 0 0 1px var(--mainBlue)"};
      &:hover {
        background: ${props.isDarkMode && `var(--mainGray)`};
      }
    `};
`;

const BlueButton = (props: BlueButtonProps) => {
  const { children, inactive, disabled, onClick } = props;
  const isDarkMode = useSelector((state: { isDarkModeSlice: boolean }) => state.isDarkModeSlice);

  return (
    <BlueButtonBox inactive={inactive} isDarkMode={isDarkMode} disabled={disabled} onClick={onClick}>
      {children}
    </BlueButtonBox>
  );
};

export default BlueButton;

import { BsFillBrightnessHighFill, BsFillMoonStarsFill } from "react-icons/bs";
import styled, { css } from "styled-components";
import { borderRadius } from "../../../style/specifiedCss/borderRadius";
import { FlexCenterDiv } from "../../atoms/FlexDiv";

const DarkModeButtonBox = styled.div`
  position: relative;
  width: 80px;
  height: 40px;
  cursor: pointer;
  > * {
    color: var(--navBackground);
    background: var(--mainText);
    pointer-events: none;
    transition: background 0.3s;
  }

  @media (max-width: 1200px) {
    width: 66px;
    height: 33px;
  }
`;

const ToggleCircle = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 5px;
  width: calc(50% - 8px);
  border-radius: ${borderRadius.round};
  background: var(--navBackground);
  transition: left 0.3s;

  ${(props) =>
    props.isDarkMode &&
    css`
      left: 44px;
      @media (max-width: 1200px) {
        left: 37px;
      }
    `}
`;

const IconBox = styled(FlexCenterDiv)`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 100%;
  border-radius: 2rem;
  font-size: 2rem;
  > * {
    flex: 1;
  }
`;

interface DarkModeButtonProps {
  isDarkMode: boolean;
  handleClickDarkModeButton: () => void;
}

const DarkModeButton = ({ isDarkMode, handleClickDarkModeButton }: DarkModeButtonProps) => {
  return (
    <DarkModeButtonBox onClick={handleClickDarkModeButton}>
      <IconBox>
        <BsFillBrightnessHighFill />
        <BsFillMoonStarsFill />
      </IconBox>
      <ToggleCircle isDarkMode={isDarkMode} />
    </DarkModeButtonBox>
  );
};

export default DarkModeButton;

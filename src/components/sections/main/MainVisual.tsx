import React from "react";
import styled from "styled-components";
import Paragraph from "../../atoms/Paragraph";
import Img from "../../atoms/Img";
import { useNavigate } from "react-router-dom";
import ScrollIndicator from "../../molecules/common/ScrollIndicator";
import BlueButton from "../../atoms/BlueButton";
import { FlexCenterDiv } from "../../atoms/FlexDiv";

const MainVisualContainer = styled(FlexCenterDiv)`
  position: relative;
  margin-bottom: 100px;
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: calc(850px - 70px);
  text-align: start;
  @media (max-width: 768px) {
    padding-top: 50px;
    height: auto;
    flex-direction: column;
  }
`;

const TextBox = styled.div`
  width: 40%;
  margin-right: 30px;

  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    text-align: center;
  }
`;

const ImageBox = styled.div`
  width: 60%;
  @media (max-width: 768px) {
    margin-bottom: 40px;
    width: 100%;
  }
`;

const LogoBox = styled.div`
  margin-bottom: 30px;
  font-weight: 700;
`;

const MainTitle = styled(Paragraph)`
  margin-bottom: 20px;
`;

const SubTitle = styled(Paragraph)`
  margin-bottom: 20px;
`;

const ContentText = styled(Paragraph)``;

const ButtonBox = styled.div`
  margin-bottom: 30px;
  display: inline-block;
  color: #fff;
  text-decoration: underline;
  text-underline-position: under;
`;

const ScrollIndicatorBox = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;

const MainVisualImgBox = styled.div``;

interface MainVisualProps {
  onMoveToFunctionCard: () => void;
}

const MainVisual = ({ onMoveToFunctionCard }: MainVisualProps) => {
  const navigate = useNavigate();

  return (
    <MainVisualContainer>
      <TextBox>
        <LogoBox>
          <MainTitle fontSize="4.8rem" fontWeight="700">
            카카오돋보기 2080
          </MainTitle>
          <SubTitle fontSize="2.6rem">20대 카톡 80대까지 간다</SubTitle>
          <ContentText fontSize="1.6rem">
            분석된 정보는 시각적으로 나타내어지며 그래프, 차트 등의 형태로 사용자에게 제공됩니다.
          </ContentText>
        </LogoBox>
        <ButtonBox>
          <BlueButton onClick={() => navigate("/attachment")}>GET STARTED</BlueButton>
        </ButtonBox>
        <ScrollIndicatorBox>
          <ScrollIndicator onClick={() => onMoveToFunctionCard()}>
            카카오 돋보기의 분석 기능
          </ScrollIndicator>
        </ScrollIndicatorBox>
      </TextBox>
      <ImageBox>
        <MainVisualImgBox>
          <Img
            src={[
              `${process.env.PUBLIC_URL}/images/main/mainVisual.png`,
              `${process.env.PUBLIC_URL}/images/main/mainVisualDark.png`,
            ]}
          />
        </MainVisualImgBox>
      </ImageBox>
    </MainVisualContainer>
  );
};

export default MainVisual;

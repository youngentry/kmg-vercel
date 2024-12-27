import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Span from "../../atoms/Span";
import Icon from "../../atoms/Icon";
import ChatRatioWithArrowGraph from "../../molecules/graphs/ChatRatioWithArrowGraph";
import ChatRoomCompareGraph from "../../molecules/graphs/ChatRoomCompareGraph";
import ChatVolumeByPeriodGraph from "../../molecules/graphs/ChatVolumeByPeriodGraph";
import ChatRateGraph from "../../molecules/graphs/ChatRateGraph";
import KeywordChartGraph from "../../molecules/graphs/KeywordChartGraph";
import ReplySpeedGraph from "../../molecules/graphs/ReplySpeedGraph";
import ChatVolumeByHourlyGraph from "../../molecules/graphs/ChatVolumeByHourlyGraph";
import { CgMaximize } from "react-icons/cg";
import { setIsModalVisible } from "../../../store/reducer/dashboard/isModalVisibleSlice";
import { FlexColumnCenterDiv, FlexRowDiv } from "../../atoms/FlexDiv";
import { AiFillInfoCircle } from "react-icons/ai";
import Tooltip from "../../atoms/Tooltip";
import { borderRadius } from "../../../style/specifiedCss/borderRadius";
import { GraphPropsInterface } from "../../../@types/index.d";
import { useLocation } from "react-router";

const GraphDisplayBox = styled(FlexColumnCenterDiv)`
  position: relative;
  padding: 10px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  border-radius: ${borderRadius.medium};
  background: var(--mainWhite);
  transition: background 0.3s;
`;

const SubjectBox = styled(FlexRowDiv)`
  position: relative;
`;

const NoticeIcon = styled.div`
  position: absolute;
  top: 1px;
  right: -19px;
  font-size: 1.5rem;
  color: var(--mainGray);
`;

const Subject = styled(Span)`
  margin-bottom: 1rem;
  font-weight: 500;
`;

const ExpandIcon = styled(Icon)`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

export const getGraphContentData = (props: GraphPropsInterface) => {
  return [
    {
      id: 0,
      subject: "채팅방 대화 비율",
      graph: <ChatRatioWithArrowGraph {...props} />,
      h2: "채팅방 대화 비율",
      h3: "대화 참여자별 대화량의 비율을 시각화하여 보여주는 그래프",
      p: "대화에 참여한 각각의 인원이 차지하는 대화량의 비율을 나타냅니다. 이를 통해 어떤 인원이 얼마나 많은 대화를 하였는지, 대화 참여율이 어떻게 되는지 등을 파악할 수 있습니다.",
    },
    {
      id: 1,
      subject: "종합 비교",
      graph: <ChatRoomCompareGraph {...props} />,
      h2: "채팅방 종합 비교",
      h3: "대화 데이터를 종합적으로 분석한 결과를 시각화하여 보여주는 화면",
      p: "대화 로그 데이터를 종합적으로 분석한 결과를 시각화하여 보여주는 화면입니다. 대화량, 대화 시간대, 답장 속도, 대화 키워드 등 다양한 정보를 종합하여 분석한 결과를 그래프, 차트, 표 등 다양한 방식으로 표시합니다.",
    },
    {
      id: 2,
      subject: "기간 대화량",
      graph: <ChatVolumeByPeriodGraph {...props} />,
      h2: "기간별 대화량",
      h3: "대화 활동의 기간별 분포에 따라 시각화하여 보여주는 그래프",
      p: "각 기간에 대한 대화량을 시각적으로 표현하여, 대화 활동이 어느 기간에 집중되어 있는지 알 수 있습니다. 이를 통해 특정 기간에 대화가 활발하게 이루어지는 경향이나 트렌드를 파악할 수 있습니다.",
    },
    {
      id: 3,
      subject: "대화 비율",
      graph: <ChatRateGraph {...props} />,
      h2: "대화 비율",
      h3: "대화 참여자별 대화량의 변화를 시간에 따라 시각화하여 보여주는 그래프",
      p: "대화에 참여한 인원들 간의 대화량을 나타냅니다. 이를 통해 각각의 인원이 대화에 얼마나 기여하였는지, 대화량이 많은 인원이 어느 정도인지 등을 파악할 수 있습니다.",
    },
    {
      id: 4,
      subject: "답장속도",
      graph: <ReplySpeedGraph {...props} />,
      h2: "답장 속도",
      h3: "대화 참여자별  평균 답장 속도를 시각화하여 보여주는 그래프",
      p: "상대방이 보낸 메시지에 대한 본인의 답장 속도를 나타냅니다. 이를 통해 메시지에 대한 대응속도가 어느정도인지, 더 빠른 대응이 필요한 상황이 있는지 등을 파악할 수 있습니다.",
    },
    {
      id: 5,
      subject: "시간대별 대화량",
      graph: <ChatVolumeByHourlyGraph {...props} />,
      h2: "시간대별 대화량",
      h3: "대화가 활발히 이루어진 시간대를 시각화하여 보여주는 그래프",
      p: "대화가 발생한 시간대를 나타냅니다. 이를 통해 대화가 활발히 이루어지는 시간대, 그리고 상대방과의 대화 타이밍을 파악할 수 있습니다.",
    },
    {
      id: 6,
      subject: "키워드",
      graph: <KeywordChartGraph {...props} />,
      h2: "카톡 습관",
      h3: "대화 내용에서 빈도수가 높은 단어를 추출하여 시각화하여 보여주는 워드 클라우드",
      p: "대화 내용에서 자주 등장하는 단어나 문구를 나타냅니다. 이를 통해 대화의 주요 주제나 키워드를 파악할 수 있으며, 이를 활용하여 대화의 내용을 더욱 효율적으로 파악하고 관리할 수 있습니다.",
    },
  ];
};

interface GraphBoxPropsInterface extends GraphPropsInterface {
  displaySubject: string;
  setCurrentModalData: (data: any) => void;
  zIndex: number;
}

const GraphBox = ({
  analyzedMessages,
  selectedChatRoomIndex,
  displaySubject,
  setCurrentModalData,
  zIndex,
}: GraphBoxPropsInterface) => {
  const dispatch = useDispatch();

  const pathname = useLocation().pathname || "";

  const [isDemoPage, setIsDemoPage] = useState(false);

  useEffect(() => {
    if (analyzedMessages.length && pathname === "/demo") {
      setIsDemoPage(true);
    }
  }, [analyzedMessages]);

  const isAnalyzedMessagesExist =
    useSelector(
      (state: { isAnalyzedMessagesExistSlice: boolean }) => state.isAnalyzedMessagesExistSlice
    ) || isDemoPage;

  const graphContentData = getGraphContentData({ analyzedMessages, selectedChatRoomIndex });
  const modalData = graphContentData.find((item) => item.subject === displaySubject) ?? {
    id: -1,
    subject: "subject",
    graph: <Span>graph element</Span>,
    h2: "h2",
    h3: "h3",
    p: "p",
  };
  const { id, subject, graph } = modalData;

  const handleClickOpenModalButton = () => {
    setCurrentModalData(modalData);
    dispatch(setIsModalVisible(true));
  };

  return (
    <GraphDisplayBox key={id}>
      {id !== 0 && (
        <ExpandIcon onClick={() => handleClickOpenModalButton()}>
          <CgMaximize />
        </ExpandIcon>
      )}
      <SubjectBox>
        <Subject>{subject}</Subject>
        {subject === "답장속도" && (
          <NoticeIcon>
            <Tooltip message="답장 시간이 빠를 수록 좌측 높은 점수가 부여됩니다. ">
              <AiFillInfoCircle />
            </Tooltip>
          </NoticeIcon>
        )}
      </SubjectBox>
      {isAnalyzedMessagesExist && graph}
    </GraphDisplayBox>
  );
};

export default GraphBox;

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getChatTimes, getReplyTimes, getSpeakers } from "../../../module/common/getProperties";
import { setSelectedChatRoomIndex } from "../../../store/reducer/dashboard/selectedRoomIndexSlice";
import {
  ChatTimes,
  GraphPropsInterface,
  NameValuePair,
  ReplyTime,
  StringNumberTuple,
} from "../../../@types/index.d";
import { setAverageReplyTime } from "../../../store/reducer/dashboard/averageReplyTimeSlice";
import { reduceAPlusB } from "../../../module/common/reduceAPlusB";
import { colorsForChatroomArray } from "../../../module/common/colorsForGraphArray";
import { lightTheme } from "../../../style/Theme";
import styled from "styled-components";
import Icon from "../../atoms/Icon";
import { setMostChattedTimes } from "../../../store/reducer/dashboard/mostChattedTimes";
import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
import { graphTooltipStyle } from "../../../style/specifiedCss/graphTooltip";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ArrowIcon = styled(Icon)`
  cursor: pointer;
`;

export const getTotalChatCounts = (chatTimes: ChatTimes[][][]) => {
  let totalChatCounts: number[] = [];
  for (const chatroom of chatTimes) {
    const times: ChatTimes[] = chatroom.flat();
    const timeSum: number[] = times.map((time: ChatTimes) => reduceAPlusB(Object.values(time)));
    totalChatCounts.push(reduceAPlusB(timeSum));
  }
  return totalChatCounts;
};

export const getTwoLettersFromSpeakers = (speakers: string[][]) => {
  let chatRoomNames: string[] = [];
  for (const chatroom of speakers) {
    chatRoomNames.push(chatroom.map((speakerName: string) => speakerName.slice(0, 2)).join());
  }
  return chatRoomNames;
};

const calculateMostChattedTime = (
  chatTimes: ChatTimes[],
  mostChattedTimeArray: ChatTimes[],
  chatroomIndex: number
) => {
  chatTimes.forEach((chatTime: ChatTimes) => {
    const chatTimeEntry = Object.entries(chatTime);
    for (let i = 0; i < chatTimeEntry.length; i++) {
      const hour: string = chatTimeEntry[i][0].slice(0, 2);
      const value: number = chatTimeEntry[i][1];
      const currentChatroom: ChatTimes = mostChattedTimeArray[chatroomIndex];
      currentChatroom[hour] ? (currentChatroom[hour] += value) : (currentChatroom[hour] = value);
    }
  });
};

export const getMostChattedTimes = (chatTimes: ChatTimes[][][]) => {
  const mostChattedTimeArray: ChatTimes[] = [];
  let chatroomIndex: number = 0;
  for (const chatroom of chatTimes) {
    mostChattedTimeArray.push({});
    const chatTimes: ChatTimes[] = chatroom.flat();
    calculateMostChattedTime(chatTimes, mostChattedTimeArray, chatroomIndex);
    chatroomIndex++;
  }
  const mostChattedTimes: StringNumberTuple[][] = mostChattedTimeArray.map((chatTimes: ChatTimes) => {
    return Object.entries(chatTimes).sort((a: StringNumberTuple, b: StringNumberTuple) => b[1] - a[1]);
  });
  return mostChattedTimes;
};

export const getAverageReplyTime = (replyTimes: ReplyTime[][][]) => {
  const averageReplyTimeArray: number[][] = [];
  for (const chatroom of replyTimes) {
    const averageReplyTime: number[] = chatroom.map((times: ReplyTime[]) => {
      const averageReplyTime: number = times.reduce(
        (acc: number, cur: ReplyTime) => acc + (cur.difference / cur.count || 0),
        times[0].difference / times[0].count || 0
      );
      return Math.floor(averageReplyTime / times.length);
    });
    averageReplyTimeArray.push(averageReplyTime);
  }
  return averageReplyTimeArray;
};

let speakers: string[][];
let chatRoomNames: string[];
let chatTimes: ChatTimes[][][];
let totalChatCounts: number[];
let pieGraphData: NameValuePair[] = [];

const SummaryPieGraph = ({ analyzedMessages, selectedChatRoomIndex }: GraphPropsInterface) => {
  const dispatch = useDispatch();

  if (!pieGraphData.length) {
    speakers = getSpeakers(analyzedMessages);
    chatRoomNames = getTwoLettersFromSpeakers(speakers);
    chatTimes = getChatTimes(analyzedMessages);
    totalChatCounts = getTotalChatCounts(chatTimes);
    pieGraphData = chatRoomNames.map((name, index) => {
      return {
        name: name,
        value: totalChatCounts[index],
      };
    });
  }

  const mostChattedTimes: StringNumberTuple[][] = getMostChattedTimes(chatTimes);
  const replyTimes: ReplyTime[][][] = getReplyTimes(analyzedMessages);
  const averageReplyTime: number[][] = getAverageReplyTime(replyTimes);

  const handleClickChatRoom = (index: number) => {
    dispatch(setSelectedChatRoomIndex(index));
  };

  const handleClickChatRoomIndexArray = (changedIndex: number) => {
    if (changedIndex === chatRoomNames.length) {
      changedIndex = 0;
    }
    if (changedIndex === -1) {
      changedIndex = chatRoomNames.length - 1;
    }
    dispatch(setSelectedChatRoomIndex(changedIndex));
  };

  useEffect(() => {
    dispatch(setAverageReplyTime(averageReplyTime[selectedChatRoomIndex]));
    dispatch(setMostChattedTimes(mostChattedTimes[selectedChatRoomIndex]));
  }, [selectedChatRoomIndex]);

  return (
    <>
      {pieGraphData && (
        <Container>
          <ArrowIcon
            onClick={() => handleClickChatRoomIndexArray(selectedChatRoomIndex - 1)}
            fontSize="3rem"
          >
            <BiLeftArrowCircle />
          </ArrowIcon>
          <ResponsiveContainer width="100%" height={"100%"}>
            <PieChart>
              <Pie
                data={pieGraphData}
                cx={"50%"}
                cy={"50%"}
                innerRadius={0}
                outerRadius={"100%"}
                dataKey="value"
                animationDuration={300}
              >
                {pieGraphData.map((_, index) => {
                  return (
                    <Cell
                      key={`cell-${index}`}
                      onClick={() => handleClickChatRoom(index)}
                      fill={colorsForChatroomArray[index % colorsForChatroomArray.length]}
                      stroke={selectedChatRoomIndex === index ? lightTheme.mainBlack : ""}
                      strokeWidth={selectedChatRoomIndex === index ? 1 : 1}
                      cursor="pointer"
                    />
                  );
                })}
              </Pie>
              <Tooltip contentStyle={graphTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>{" "}
          <ArrowIcon
            onClick={() => handleClickChatRoomIndexArray(selectedChatRoomIndex + 1)}
            fontSize="3rem"
          >
            <BiRightArrowCircle />
          </ArrowIcon>
        </Container>
      )}
    </>
  );
};

export default SummaryPieGraph;

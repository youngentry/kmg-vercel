import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChatTimes, GraphPropsInterface, WeekData } from "../../../@types/index.d";
import { getSpeakers } from "../../../module/common/getProperties";
import { customTickColor, setRotationColor } from "../../../module/common/colorsForGraphArray";
import styled from "styled-components";
import ReplyCountByHourlyGraph from "./ReplyCountByHourlyGraph";
import { graphTooltipStyle } from "../../../style/specifiedCss/graphTooltip";

const TooltipBox = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #fff;
  > ul {
    > li {
      margin-bottom: 5px;
    }
  }
`;

const getDayIndex = (date: string) => {
  const parsedDate = parseInt(date);
  const dayOfWeek: number = new Date(
    2000 + Math.floor(parsedDate / 10000),
    (Math.floor(parsedDate / 100) % 100) - 1,
    parsedDate % 100
  ).getDay();
  return dayOfWeek;
};

const getMostValue = (array: any) => {
  return Math.max(
    ...array.map((item: any) => {
      return Math.max(
        ...item.values.map((hourData: any) => {
          return hourData.value;
        })
      );
    })
  );
};

const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

let selectedChatRoomData: any;
let speakerNames: any;
let speakerTotalChatTimes: Record<string, Record<string, Record<string, number>>>;
let mostValues: number[];
let graph: any[];
let totalTimezoneData;

const getSpeakerTotalChatTimes = (selectedChatRoomData: any) => {
  speakerTotalChatTimes = {};
  Object.values(selectedChatRoomData).forEach((chatroom: any) => {
    Object.values(chatroom).forEach((chat: any) => {
      const speaker = chat.speaker;
      const date = getDayIndex(chat.date);
      if (!speakerTotalChatTimes[speaker]) {
        speakerTotalChatTimes[speaker] = {};
      }
      if (!speakerTotalChatTimes[speaker][date]) {
        speakerTotalChatTimes[speaker][date] = {};
        for (let i = 0; i < 24; i++) {
          speakerTotalChatTimes[speaker][date][i.toString()] = 0;
        }
      }
      const chatTimes = chat.chatTimes;
      if (chatTimes) {
        Object.keys(chatTimes).forEach((time) => {
          const hour = parseInt(time.split(":")[0]);
          speakerTotalChatTimes[speaker][date][hour] += chatTimes[time];
        });
      }
    });
  });

  return speakerTotalChatTimes;
};

const getWeekData = (speakerTotalChatTimes: any): any => {
  mostValues = [];
  graph = [];
  Object.entries(speakerTotalChatTimes).forEach((speaker: any) => {
    const weekData: WeekData[] = [];

    const timeDataOfWeek: ChatTimes = speaker[1];
    const timeTable: any[] = Object.values(timeDataOfWeek);

    daysOfWeek.forEach((day: string, index: number) => {
      weekData.push({
        day: day,
        values: [],
      });
      const timeTableDay = timeTable[index];
      for (const timeNumber in timeTableDay) {
        weekData.at(-1)?.values.push({
          hour: timeNumber,
          value: timeTableDay[timeNumber],
          index: 1,
        });
      }
    });
    graph.push(weekData);
    mostValues.push(getMostValue(weekData));
  });

  return { mostValues, graph };
};

const ChatVolumeByHourlyGraph = ({ analyzedMessages, selectedChatRoomIndex }: GraphPropsInterface) => {
  const selectedSpeakerIndex = useSelector(
    (state: { selectedSpeakerIndexSlice: number }) => state.selectedSpeakerIndexSlice
  );
  const volumeHourlyBoxSize = useSelector(
    (state: { volumeHourlyBoxSizeSlice: number[] }) => state.volumeHourlyBoxSizeSlice
  );

  const [scatter, setScatter] = useState<any>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState<number>(selectedSpeakerIndex);

  useEffect(() => {
    setScatter([]);
  }, [selectedChatRoomIndex]);

  if (!scatter.length) {
    selectedChatRoomData = analyzedMessages[selectedChatRoomIndex];
    speakerNames = getSpeakers(analyzedMessages)[selectedChatRoomIndex];
    speakerNames.unshift("전체");

    const speakerTotalChatTimes = getSpeakerTotalChatTimes(selectedChatRoomData);
    const { mostValues, graph } = getWeekData(speakerTotalChatTimes);

    totalTimezoneData = JSON.parse(JSON.stringify(graph[0]));
    for (let i = 1; i < graph.length; i++) {
      for (let j = 0; j < graph[i].length; j++) {
        for (let k = 0; k < graph[i][j].values.length; k++) {
          totalTimezoneData[j].values[k].value += graph[i][j].values[k].value;
        }
      }
    }
    mostValues.unshift(getMostValue(totalTimezoneData));
    graph.unshift(totalTimezoneData);
  }

  useEffect(() => {
    setScatter(graph);
  }, [selectedChatRoomData]);

  useEffect(() => {
    setCurrentSpeakerIndex(selectedSpeakerIndex + 1);
  }, [selectedSpeakerIndex]);

  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (active && payload?.length) {
      const data = payload[0]?.payload;

      return (
        <TooltipBox style={graphTooltipStyle}>
          <p>
            {data.hour}
            <span>시</span>
          </p>
          <p
            style={{
              color: setRotationColor(currentSpeakerIndex),
            }}
          >
            <span>대화량: </span>
            {data.value}
          </p>
        </TooltipBox>
      );
    }

    return null;
  };

  return (
    <>
      {scatter.length &&
        scatter[currentSpeakerIndex].map((item: any, index: number) => {
          return (
            <ResponsiveContainer key={index} width="100%" height={"10.1%"}>
              <ScatterChart
                margin={{
                  top: 10,
                  right: 5,
                  bottom: -12,
                  left: -38,
                }}
              >
                <XAxis
                  type="category"
                  dataKey="hour"
                  name="hour"
                  interval={0}
                  axisLine={false}
                  tick={{
                    dy: -16,
                    fontSize: 12,
                    ...customTickColor,
                  }}
                  tickLine={false}
                  height={24}
                />
                <YAxis
                  type="number"
                  dataKey="index"
                  height={10}
                  width={70}
                  tick={false}
                  axisLine={false}
                  label={{
                    value: `${item.day}`,
                    position: "insideRight",
                    ...customTickColor,
                  }}
                  fontSize={7}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  wrapperStyle={{ zIndex: 100 }}
                  content={renderTooltip}
                />
                <Scatter
                  data={item.values}
                  shape={(item) => {
                    const mostValue =
                      currentSpeakerIndex === -1 ? mostValues[0] : mostValues[currentSpeakerIndex];

                    const itemWidth = volumeHourlyBoxSize[0] / 25.7;
                    const itemHeight = volumeHourlyBoxSize[1] / 7;
                    const opacity = item.value / mostValue;
                    return (
                      <rect
                        fill={setRotationColor(currentSpeakerIndex)}
                        x={item.cx - itemWidth / 2}
                        y={item.cy - itemHeight / 2}
                        width={itemWidth}
                        height={itemHeight}
                        opacity={opacity}
                      />
                    );
                  }}
                  fill={setRotationColor(currentSpeakerIndex)}
                  animationDuration={300}
                />
              </ScatterChart>
            </ResponsiveContainer>
          );
        })}
      <ReplyCountByHourlyGraph
        analyzedMessages={analyzedMessages}
        selectedChatRoomIndex={selectedChatRoomIndex}
      />
    </>
  );
};

export default ChatVolumeByHourlyGraph;

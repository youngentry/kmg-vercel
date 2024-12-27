import { OriginMessageData } from "../../@types/index.d";
import { padToTwoDigits } from "../common/padToTwoDigits";

const regexForIOS = /(\n(?!\d{4}\. \d{1,2}\. \d{1,2}\. (오후|오전) \d{1,2}:\d{1,2},))/g;
const regexForWindow = /(.+?)\] \[(오후|오전) \d{1,2}:\d{1,2}] /;
const regexForMacOS = /(\n(?!\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},"))/g;
const regexForAndroid = /(\n(?!\d{4}년 \d{1,2}월 \d{1,2}일 (오후|오전) \d{1,2}:\d{2},))/g;

/**
 * 라인 배열에서 데이터를 추출합니다.
 * @param {string[]} filteredMessageLineArray - 필터링된 라인 배열입니다.
 * @returns {OriginMessageData[]} - 라인 배열에서 추출된 데이터 객체의 배열입니다.
 */
const getDataObjectFromLines = (filteredMessageLineArray: string[]): OriginMessageData[] => {
  return filteredMessageLineArray.map((line) => {
    const [dateTime, content] = line.split(", ", 2);
    const [year, month, day, time] = dateTime.split(". ");
    const [fullHour, minute] = time.split(":");
    const [meridiem, hour] = fullHour.split(" ");
    const hour12 = hour === "12" ? 0 : Number(hour);
    const [speaker, message] = content.split(" : ");
    const keywords = message.split(" ").map((word) => word.trim());
    return {
      date: `${year.slice(-2)}${padToTwoDigits(month)}${padToTwoDigits(day)}`,
      hour: meridiem === "오전" ? padToTwoDigits(hour12) : (hour12 + 12).toString(),
      minute: padToTwoDigits(minute),
      speaker,
      keywords,
    };
  });
};

/**
 * base64 인코딩 스트링을 UTF-8로 디코딩합니다.
 * @param {string} base64String base64로 인코딩된 string
 * @returns {string} UTF-8로 디코딩된 string.
 */
const utf8Decode = (base64String: string) => {
  const decodedBytes = new Uint8Array(
    atob(base64String.replace(/^data:.*?;base64,/, ""))
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const decoder = new TextDecoder("utf-8");
  const decodedString = decoder.decode(decodedBytes);
  return decodedString;
};

/**
 * 텍스트 파일을 받아 파싱하여 메시지 데이터를 반환합니다.
 * @param {string} base64 - base64 인코딩된 텍스트 파일
 * @returns {Array} 메시지 데이터 배열
 */
const breakdownTextFileForIOS = (decodedTextFile: string) => {
  const filteredMessageLineArray = decodedTextFile.replace(regexForIOS, " ").split("\n").slice(1);
  return getDataObjectFromLines(filteredMessageLineArray);
};

const breakdownTextFileForWindow = (decodedTextFile: string) => {
  const earlyFilterWord = "요일 ---------------\r\n[";
  const allLineArray = decodedTextFile.split("\n--------------- 20");
  const filteredMessageLineArray = allLineArray.filter((line) =>
    line.slice(0, 34).includes(earlyFilterWord)
  );
  const dateMessagePair = filteredMessageLineArray.map((item: string) => item.split(earlyFilterWord));
  const dateMessageObject = dateMessagePair.map((pair: string[]) => {
    return {
      date: pair[0],
      message: pair[1].split("\r\n[").filter((item) => {
        return regexForWindow.test(item);
      }),
    };
  });

  const transformedMessageLineArray = dateMessageObject.map((Object) => {
    const [year, month, day] = Object.date.split(" ", 3);
    const dateString = `${year.replace("년", ".")} ${month.replace("월", ".")} ${day.replace(
      "일",
      "."
    )}`;
    const speakerTimeMessageStringArray = Object.message.map((item) => {
      const [name, timeMessage] = item.split("] [", 2);
      const [time, message] = timeMessage.split("] ", 2);
      return `${dateString} ${time}, ${name} : ${message}`;
    });

    return speakerTimeMessageStringArray;
  });
  return getDataObjectFromLines(transformedMessageLineArray.flat());
};

const breakdownTextFileForMacOS = (decodedTextFile: string) => {
  const filteredMessageLineArray = decodedTextFile.replace(regexForMacOS, " ").split("\n").slice(1);

  const transformedMessageLineArray = filteredMessageLineArray.map((line) => {
    let [dateTime, speaker, message] = line.split(",", 3);
    const [date, time] = dateTime.split(" ");
    let [year, month, day] = date.split("-");
    year = year.slice(2);
    let [hour, minute] = time.split(":", 2);
    const period = Number(hour) >= 12 ? "오후" : "오전";
    const formattedHour = hour === "00" ? "오전 12" : `${period} ${Number(hour) % 12}`;

    while (speaker[0] === '"' && speaker.length > 2) {
      speaker = speaker.slice(1, speaker.length - 1);
    }

    message = message.slice(1, message.length - 1);
    return `${year}. ${month}. ${day}. ${formattedHour}:${minute}, ${speaker} : ${message}`;
  });

  return getDataObjectFromLines(transformedMessageLineArray);
};

const breakdownTextFileForAndroid = (decodedTextFile: string) => {
  const filteredMessageLineArray = decodedTextFile.replace(regexForAndroid, " ").split("\n").slice(1);

  const transformedMessageLineArray = filteredMessageLineArray.map((item) => {
    const transformedItem = item.replace("년", ".").replace("월", ".").replace("일", ".");
    return transformedItem;
  });

  return getDataObjectFromLines(transformedMessageLineArray);
};

export const readAsDataURL = (file: File) => {
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => resolve(reader.result as string | null);
  });
};

export const decodeTextFile = (base64: string, osIndex: number) => {
  const decodedTextFile = utf8Decode(base64.toString());
  switch (osIndex) {
    case 1:
      return breakdownTextFileForWindow(decodedTextFile);
    case 2:
      return breakdownTextFileForMacOS(decodedTextFile);
    case 3:
      return breakdownTextFileForAndroid(decodedTextFile);
    case 4:
      return breakdownTextFileForIOS(decodedTextFile);
    default:
      return [];
  }
};

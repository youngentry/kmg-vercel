import { useState } from 'react';
import {
  AnalyzedMessage,
  Chatroom,
  FileObject,
  MessageInfo,
  OriginMessageData,
} from '../@types/index.d';
import { getMessageData } from '../module/core/getMessageData';
import { decodeTextFile, readAsDataURL } from '../module/core/breakdownTxtFile';
import { useDispatch } from 'react-redux';
import { setAttachedFileList } from '../store/reducer/attachment/attachedFileListSlice';
import { setAnalyzedMessages } from '../store/reducer/dashboard/analyzedMessagesSlice';
import { setIsAnalyzedMessagesExist } from '../store/reducer/dashboard/isAnalyzedMessagesExistSlice';

const useAnalyzeMessages = () => {
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  /**
   * 메시지 데이터를 테이블 형태로 변환합니다.
   * @param {any[]} analyzedMessages - 분석된 메시지 데이터 배열
   * @returns {AnalyzedMessage[][][]} - 테이블 형태로 변환된 분석된 메시지 데이터
   */
  const transformIntoTableForm = (analyzedMessages: any[]) => {
    const analyzedMessageData: AnalyzedMessage[][][] = analyzedMessages.map(
      (chatRooms: Chatroom[]) => {
        return chatRooms.map((chatRoom: Chatroom) => {
          const { speaker, dates } = chatRoom;
          return dates.map((date: MessageInfo) => {
            return {
              speaker: speaker,
              date: date.date,
              chatTimes: date.data.chatTimes,
              keywordCounts: date.data.keywordCounts,
              replyTime: date.data.replyTime,
            };
          });
        });
      }
    );
    return analyzedMessageData;
  };

  /**
   * 텍스트 파일을 메시지 데이터로 디코딩합니다.
   * @param {any[]} attachedFileList - 첨부된 파일 배열
   * @returns {Promise<any[]>} - 디코딩된 메시지 데이터 배열을 포함하는 프로미스 객체
   */
  const decodeTxtFileToMessageData = async (
    attachedFileList: any[],
    osIndex: number | null
  ) => {
    setIsAnalyzeLoading(true);
    const analyzedMessages: MessageInfo[][] = [];
    for (const fileGroup of attachedFileList) {
      const filteredMessages: OriginMessageData[][] = await Promise.all(
        fileGroup.map(async (file: File) => {
          const base64 = await readAsDataURL(file);
          return osIndex && base64 && decodeTextFile(base64, osIndex);
        })
      );
      const messageData = getMessageData(filteredMessages.flat());
      analyzedMessages.push([...messageData]);
    }
    return analyzedMessages;
  };

  /**
   * 메시지를 분석합니다.
   * @param {any[]} attachedFileList - 첨부된 파일 배열
   * @returns {Promise<AnalyzedMessage[][][]>} - 분석된 메시지 데이터 배열을 포함하는 프로미스 객체
   */
  const analyzeMessage = async (
    attachedFileList: FileObject[][],
    osIndex: number | null
  ) => {
    const analyzedMessages: MessageInfo[][] = await decodeTxtFileToMessageData(
      attachedFileList,
      osIndex
    );
    const analyzedMessageData: AnalyzedMessage[][][] =
      transformIntoTableForm(analyzedMessages);
    console.log(analyzedMessageData);
    return analyzedMessageData;
  };

  const dispatchAnalyzedMessages = async (
    attachedFileList: FileObject[][],
    selectedOsIndex = 2
  ) => {
    const analyzedMessage: AnalyzedMessage[][][] = await analyzeMessage(
      attachedFileList,
      selectedOsIndex
    );

    let indexesToFilterAttackedFile: number[] = [];
    const filteredMessage = analyzedMessage.filter((messages, index) => {
      if (messages.length !== 0) {
        indexesToFilterAttackedFile.push(1);
        return true;
      } else {
        indexesToFilterAttackedFile.push(0);
        return false;
      }
    });

    const filteredAttackedFileList: FileObject[][] = [];
    indexesToFilterAttackedFile.forEach((ableFileIndex, index) => {
      ableFileIndex && filteredAttackedFileList.push(attachedFileList[index]);
    });

    const removedChatroomIndex = indexesToFilterAttackedFile.map((n, index) => {
      return n === 0 && index + 1;
    });

    if (filteredMessage.length !== analyzedMessage.length) {
      alert(
        `${removedChatroomIndex
          .filter((filterIndex) => filterIndex)
          .join(
            ', '
          )}번째 채팅방은 분석이 불가능하여 제외되었습니다. 파일의 형식 또는 내용이 올바른 파일인지 다시 확인해 주세요.`
      );
    }

    dispatch(setAttachedFileList(filteredAttackedFileList));
    if (filteredMessage.length === 0) {
      return false;
    }

    dispatch(setAnalyzedMessages(filteredMessage));
    dispatch(setIsAnalyzedMessagesExist(true));

    return true;
  };

  return { dispatchAnalyzedMessages, isAnalyzeLoading, setIsAnalyzeLoading };
};

export default useAnalyzeMessages;

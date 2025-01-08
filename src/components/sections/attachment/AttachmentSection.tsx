import React, { useRef } from 'react';
import styled from 'styled-components';
import AttachedFileList from '../../molecules/attachment/AttachedFileList';
import BlueButton from '../../atoms/BlueButton';
import ScrollIndicator from '../../molecules/common/ScrollIndicator';
import FileDrop from '../../organisms/attachment/FileDrop';
import { FileObject } from '../../../@types/index.d';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import scrollToEvent from '../../../module/common/scrollToEvent';
import { pushNewlyAttachedFiles } from '../../../store/reducer/attachment/attachedFileListSlice';
import Paragraph from '../../atoms/Paragraph';
import OsList from '../../organisms/attachment/OsList';
import { FlexColumnCenterDiv } from '../../atoms/FlexDiv';
import Loading from '../../molecules/common/Loading';
import { borderRadius } from '../../../style/specifiedCss/borderRadius';
import useAnalyzeMessages from '../../../hooks/useAnalyzeMessages';

const AttachmentSectionBox = styled(FlexColumnCenterDiv)`
  position: relative;
  margin: 8rem auto 0 auto;
  padding: 8rem 0;
  max-width: 1220px;

  @media (max-width: 768px) {
    margin: 6rem auto 0 auto;
  }
`;

const ButtonBox = styled.div`
  margin-bottom: 30px;
  > :first-child {
    margin-bottom: 10px;
  }
`;

const OsContentBox = styled.div`
  margin: 0 auto 30px auto;
  padding: 10rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3rem;
  width: 80%;
  height: 420px;
  max-width: 970px;
  border: 2px dashed var(--mainGray);
  border-radius: ${borderRadius.strong};

  @media (max-width: 480px) {
    padding: 6rem 2rem;
  }
`;

const OsContentTitle = styled(Paragraph)`
  font-size: 2.4rem;
`;

const OsListBox = styled.div``;

const OsNotice = styled(Paragraph)`
  font-size: 1.5rem;
  color: var(--mainBlueHover);
  text-align: center;
  transition: color 0.3s;
`;

const ScrollIndicatorBox = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;

// 파일 확장자 허용 타입
export const isAllowedFileType = (file: File): boolean => {
  const allowedExtensions = ['.txt', '.csv'];
  const fileType = file.name.substring(file.name.lastIndexOf('.'));
  return allowedExtensions.includes(fileType);
};

const AttachmentSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dispatchAnalyzedMessages, isAnalyzeLoading, setIsAnalyzeLoading } =
    useAnalyzeMessages();

  const selectedOsIndex = useSelector(
    (state: { selectedOsIndexSlice: number }) => state.selectedOsIndexSlice
  );
  const attachedFileList = useSelector(
    (state: { attachedFileListSlice: FileObject[][] }) =>
      state.attachedFileListSlice
  );

  const attachmentSectionRef = useRef<HTMLDivElement | null>(null);

  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | null = event.target.files;
    if (files && files.length) {
      dispatch(pushNewlyAttachedFiles(Array.prototype.slice.call(files)));
    }
  };

  const handleClickAnalyzeButton = async () => {
    try {
      const analysisSuccess = await dispatchAnalyzedMessages(attachedFileList);
      const windowWidth = window.innerWidth;
      setIsAnalyzeLoading(false);
      if (analysisSuccess) {
        if (windowWidth > 1200) {
          navigate('/dashboard');
        } else {
          navigate('/detail');
        }
      }
    } catch {
      alert(
        '파일 분석에 실패하였습니다. 대화 파일의 운영체제가 올바르게 선택되었는지 확인해주세요.'
      );
      setIsAnalyzeLoading(false);
    }
  };

  const handleScrollDown = () => {
    if (attachmentSectionRef.current) {
      scrollToEvent(
        attachmentSectionRef.current.offsetTop +
          attachmentSectionRef.current.offsetHeight -
          30,
        'smooth'
      );
    }
  };

  return (
    <AttachmentSectionBox ref={attachmentSectionRef}>
      {isAnalyzeLoading && <Loading />}
      {!selectedOsIndex ? (
        <OsContentBox>
          <OsContentTitle>
            자신의 운영체제 아이콘을 선택해 주세요.
          </OsContentTitle>
          <OsListBox>
            <OsList />
          </OsListBox>
          <OsNotice>
            * 올바른 운영체제를 선택하지 않으면 분석이 불가능합니다.
          </OsNotice>
        </OsContentBox>
      ) : (
        <>
          <FileDrop handleChangeFile={handleChangeFile}></FileDrop>
          <AttachedFileList />
          <ButtonBox>
            <BlueButton
              onClick={handleClickAnalyzeButton}
              disabled={!attachedFileList.length}
            >
              분석하기
            </BlueButton>
            {!attachedFileList.length && (
              <OsNotice>* 파일을 첨부해 주세요</OsNotice>
            )}
          </ButtonBox>
          <ScrollIndicatorBox>
            <ScrollIndicator onClick={handleScrollDown}>
              카카오톡 메시지 내보내기 방법은?
            </ScrollIndicator>
          </ScrollIndicatorBox>
        </>
      )}
    </AttachmentSectionBox>
  );
};

export default AttachmentSection;

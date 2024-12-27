import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AttachmentSection from "../sections/attachment/AttachmentSection";
import AttachmentDescriptionSection from "../sections/attachment/AttachDescriptionSection";
import scrollToEvent from "../../module/common/scrollToEvent";
import { FlexColumnCenterDiv } from "../atoms/FlexDiv";
import { useDispatch, useSelector } from "react-redux";
import { pushNewlyAttachedFiles } from "../../store/reducer/attachment/attachedFileListSlice";
import { VscNewFile } from "react-icons/vsc";
import Span from "../atoms/Span";
import { zIndex } from "../../style/specifiedCss/zIndex";

const AttachmentPageBox = styled.div``;

const DropZone = styled(FlexColumnCenterDiv)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  font-size: 300px;
  color: #fff;
  background: #00000081;
  z-index: ${zIndex.dropZone};
  > * {
    pointer-events: none;
  }
`;

const DropNotice = styled(Span)`
  color: ${(props) => props.theme.bothWhite};
`;

const AttachmentPage = () => {
  const dispatch = useDispatch();

  const [dragging, setDragging] = useState(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!selectedOsIndex) {
      return;
    }
    setDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files: any = Array.prototype.slice.call(e.dataTransfer.files);

    if (files && files.length) {
      dispatch(pushNewlyAttachedFiles(files));
    }
  };

  const selectedOsIndex = useSelector(
    (state: { selectedOsIndexSlice: number }) => state.selectedOsIndexSlice
  );

  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    scrollToEvent(0, "auto");
  }, []);

  return (
    <AttachmentPageBox onDragOver={handleDragOver}>
      {screenWidth > 769 && dragging && (
        <DropZone onDragEnd={handleDragEnd} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <VscNewFile size={60} />
          <DropNotice>Drop Files Here</DropNotice>
        </DropZone>
      )}
      <AttachmentSection />
      <AttachmentDescriptionSection />
    </AttachmentPageBox>
  );
};

export default AttachmentPage;

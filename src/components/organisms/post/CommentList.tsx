import React, { useState } from "react";
import styled from "styled-components";
import { displayCreatedAt } from "../../../module/common/postTime";
import { FlexColumnDiv, FlexRowDiv } from "../../atoms/FlexDiv";
import { AccessToken, Comment, Post, UserData } from "../../../@types/index.d";
import axios from "axios";
import PublishForm from "../../molecules/post/PublishForm";

const CommentContainer = styled.div`
  border-radius: 5px;
`;

const CurrentPostProfile = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: no-repeat center center/cover url(${process.env.PUBLIC_URL + "/favicon.png"});
`;

const CommentUl = styled.ul`
  list-style: none;
  padding: 0;
`;

const CommentItem = styled.li`
  margin: 10px 0;
`;
const CommentBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

const UserContainer = styled(FlexRowDiv)`
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const CommentButtonBox = styled.div``;
const UserBox = styled(FlexColumnDiv)`
  gap: 5px;
`;
const CommentContent = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
  font-size: 1.6rem;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
`;

const CommentTime = styled.span`
  font-size: 1.2rem;
  color: #777;
`;

const EditCommentButton = styled.button`
  background: none;
  text-decoration: underline;
  border: none;
  cursor: pointer;
`;

const DeleteCommentButton = styled.button`
  background: none;
  text-decoration: underline;
  border: none;
  cursor: pointer;
`;

const CommentFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
`;

const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
`;

const EditCommentInput = styled.input`
  padding: 8px;
  margin-bottom: 10px;
  display: block;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

interface CommentListProps {
  userData: UserData;
  accessToken: AccessToken;
  currentPost: Post | null;
  isPostEditing: boolean;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  commentCount: number;
  setCommentCount: React.Dispatch<React.SetStateAction<number>>;
}

const CommentList = ({
  accessToken,
  userData,
  currentPost,
  isPostEditing,
  comments,
  setComments,
  commentCount,
  setCommentCount,
}: CommentListProps) => {
  const [editingCommentId, setEditingCommentId] = useState<String>("");
  const [editComment, setEditComment] = useState<string>();
  const [isCommentEditing, setIsCommentEditing] = useState<boolean>(false);
  const [editIsPrivateComment, setEditIsPrivateComment] = useState<boolean | undefined>();

  const clickEditComment = async (e: React.FormEvent<HTMLButtonElement>, comment: Comment) => {
    e.preventDefault();
    requestCheckCommentAuthorization(comment);
    successClickEditComment(comment);
  };

  const requestCheckCommentAuthorization = async (comment: Comment) => {
    try {
      await axios.get(
        `/api/protected/posts/${currentPost?.postId}/comments/${comment._id}/authorization`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const successClickEditComment = (comment: Comment) => {
    setEditComment(comment.comment);
    setEditIsPrivateComment(comment.isPrivate);
    setIsCommentEditing(!isPostEditing);
    setEditingCommentId(comment._id);
  };

  const handleDeletedComment = async (e: React.MouseEvent, comment: Comment) => {
    e.preventDefault();
    try {
      const result = await axios.delete(
        `/api/protected/posts/${currentPost?.postId}/comments/${comment._id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const copiedComments = [...comments];
      const afterDeletedComments = copiedComments.filter((item) => item._id !== comment._id);
      setComments([...afterDeletedComments]);
      setCommentCount(commentCount - 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditPrivateCommentChange = (e: any) => {
    e.preventDefault();
    setEditIsPrivateComment(e.target.checked);
  };

  const submitEditComment = async (
    e: React.FormEvent<HTMLFormElement>,
    currentPost: Post | null,
    comment: Comment
  ) => {
    e.preventDefault();
    const toEditCommentData = {
      comment: editComment,
      isPrivateComment: editIsPrivateComment,
    };

    try {
      const result = await axios.put(
        `/api/protected/posts/${currentPost?.postId}/comments/${comment._id}`,
        { ...toEditCommentData },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const editedCommentId = result.data.comment._id;
      const editedCommentIndex = comments.findIndex((item: any) => item._id === editedCommentId);

      const copiedComments = [...comments];
      copiedComments[editedCommentIndex] = {
        ...result.data.comment,
        ...toEditCommentData,
      };
      setComments(copiedComments);
      setIsCommentEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CommentContainer>
      <CommentUl>
        {comments.length ? (
          comments.map((comment: Comment) => (
            <CommentItem key={comment._id}>
              <CommentBox>
                <UserContainer>
                  <CurrentPostProfile />
                  <UserBox>
                    <CommentAuthor>{comment.nickname}</CommentAuthor>
                    <CommentTime> {displayCreatedAt(comment.createdAt)}</CommentTime>
                  </UserBox>
                </UserContainer>
                {userData?.userId === comment?.userId && (
                  <CommentButtonBox>
                    <EditCommentButton onClick={(e) => clickEditComment(e, comment)}>
                      수정
                    </EditCommentButton>
                    <DeleteCommentButton onClick={(e) => handleDeletedComment(e, comment)}>
                      삭제
                    </DeleteCommentButton>
                  </CommentButtonBox>
                )}
              </CommentBox>

              {editingCommentId === comment._id && isCommentEditing ? (
                <CommentFormContainer>
                  <FormGroup onSubmit={(e) => submitEditComment(e, currentPost, comment)}>
                    <EditCommentInput
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />

                    <PublishForm
                      isChecked={editIsPrivateComment}
                      onCheckboxChange={(e: { target: { checked: any } }) =>
                        handleEditPrivateCommentChange(e.target.checked)
                      }
                      current="댓글 수정하기"
                      onSubmit={null}
                    />
                  </FormGroup>
                </CommentFormContainer>
              ) : (
                <CommentContent>{comment.comment}</CommentContent>
              )}
            </CommentItem>
          ))
        ) : (
          <CommentItem>댓글이 없습니다.</CommentItem>
        )}
      </CommentUl>
    </CommentContainer>
  );
};

export default CommentList;

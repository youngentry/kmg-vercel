import axios from "axios";
import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setUserLoginDataSlice } from "../../../store/reducer/userData/userLoginDataSlice";
import { AccessToken } from "../../../@types/index.d";

const LogOutBox = styled.div`
  cursor: pointer;
`;

const LogOutButton = () => {
  const dispatch = useDispatch();

  const accessToken = useSelector(
    (state: { userLoginAccessTokenSlice: AccessToken }) => state.userLoginAccessTokenSlice
  );

  // LogOut Post 요청 보내기
  const postLogOut = async () => {
    try {
      const result = await axios.post("/api/protected/users/signout", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return result.data;
    } catch (error) {
      console.error(error);
    }
  };

  // LogOut 상태 업데이트
  const handleLogOutDispatch = () => {
    dispatch(
      setUserLoginDataSlice({
        userId: "",
        nickname: "",
      })
    );
  };

  // LogOut LogOutBox 클릭 핸들러
  const handleClickLogoutButton = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      await postLogOut();
    } catch (error) {
      console.error(error);
    }
    handleLogOutDispatch();
  };

  return <LogOutBox onClick={(e) => handleClickLogoutButton(e)}>로그아웃</LogOutBox>;
};

export default LogOutButton;

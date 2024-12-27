import MainPage from "./components/pages/MainPage";
import { Routes, Route } from "react-router-dom";
import AttachmentPage from "./components/pages/AttachmentPage";
import DashboardPage from "./components/pages/DashboardPage";
import Footer from "./components/sections/footer/Footer";
import DetailPage from "./components/pages/DetailPage";
import FloatingMenu from "./components/molecules/common/FloatingMenu";
import Wrapper from "./components/wrapper/Wrapper";
import GlobalStyle from "./style/GlobalStyles";
import Navigation from "./components/sections/navigation/Navigation";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getTokenFromCookie } from "./module/common/getTokenFromCookie";
import PostPage from "./components/pages/PostPage";
import LogInForm from "./components/organisms/login/LogInForm";
import { UserData } from "./@types/index.d";
import UserPage from "./components/pages/UserPage";
import SignUpForm from "./components/organisms/login/SignUpForm";
import DemoPage from "./components/pages/DemoPage";
import NotFoundPage from "./components/pages/NotFoundPage";

function App() {
  const location = useLocation();
  const isDashboardPage = location.pathname === "/dashboard";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");

  useEffect(() => {
    const cookieCheckForRememberLogin = async () => {
      const cookieAccessToken = getTokenFromCookie(document.cookie);
      if (cookieAccessToken) {
        const result = await axios.post("/api/users/login", null, {
          headers: {
            Authorization: `Bearer ${cookieAccessToken}`,
          },
        });
        setAccessToken(accessToken);
        return setUserData(result.data.data);
      }
    };
    (async () => cookieCheckForRememberLogin())();
  }, []);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <FloatingMenu />
        <Navigation />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/attachment" element={<AttachmentPage />} />
          <Route>
            <Route path="/users" element={<UserPage />}>
              <Route path="login" element={<LogInForm />} />
              <Route path="create" element={<SignUpForm />} />
            </Route>
          </Route>
          <Route path="/posts" element={<PostPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/detail" element={<DetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {isDashboardPage ? <Footer dashboard={true} /> : <Footer />}
      </Wrapper>
    </>
  );
}

export default App;

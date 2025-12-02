import { Outlet } from "react-router-dom";
import Layout from "./Layout";
import Header from "./Header";
import MainContent from "./MainContent";

const AuthenticatedLayout = () => {
  return (
    <Layout>
      <Header />
      <MainContent>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </div>
      </MainContent>
    </Layout>
  );
};

export default AuthenticatedLayout;

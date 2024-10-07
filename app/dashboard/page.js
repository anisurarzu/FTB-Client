"use client";

import { Layout, Menu, Button, Spin, Drawer, Avatar } from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  MenuOutlined,
} from "@ant-design/icons"; // Icons
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardHome from "@/component/DashboardHome";
import AgentInformation from "@/component/AgentInformation";
import HotelCategory from "@/component/HotelCategory";
import HotelInformation from "@/component/HotelInformation";
import HotelRoom from "@/component/HotelRoom";
import BookingInfo from "@/component/BookingInfo";
import Calender from "@/component/Calender";

const { Header, Sider, Content } = Layout;

// Define a permissions object mapping roles to allowed pages
const rolePermissions = {
  superadmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: <DashboardHome />,
    },
    {
      key: "2",
      label: "Users",
      icon: <UsergroupAddOutlined />,
      component: <AgentInformation />,
    },
    {
      key: "3",
      label: "Flat/Room Type",
      icon: <ApartmentOutlined />,
      component: <HotelCategory />,
    },
    {
      key: "4",
      label: "Flat/Room No",
      icon: <UnorderedListOutlined />,
      component: <HotelRoom />,
    },
    {
      key: "5",
      label: "Hotel Info",
      icon: <FileTextOutlined />,
      component: <HotelInformation />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <SettingOutlined />,
      component: <BookingInfo />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <SettingOutlined />,
      component: <Calender />,
    },
    { key: "8", label: "Settings", icon: <SettingOutlined />, component: null },
  ],
  agentadmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: <DashboardHome />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <SettingOutlined />,
      component: <BookingInfo />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <SettingOutlined />,
      component: <Calender />,
    },
  ],
  hoteladmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: <DashboardHome />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <SettingOutlined />,
      component: <BookingInfo />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <SettingOutlined />,
      component: <Calender />,
    },
  ],
  admin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: <DashboardHome />,
    },
    {
      key: "2",
      label: "Users",
      icon: <UsergroupAddOutlined />,
      component: <AgentInformation />,
    },
    {
      key: "5",
      label: "Hotel Info",
      icon: <FileTextOutlined />,
      component: <HotelInformation />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <SettingOutlined />,
      component: <BookingInfo />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <SettingOutlined />,
      component: <Calender />,
    },
  ],
};

const Dashboard = ({ sliders }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, selectedMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    router.push("/login");
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const renderContent = () => {
    const userRole = userInfo?.role?.value; // Accessing user role from userInfo object
    const allowedPages = rolePermissions[userRole] || [];
    const selectedPage = allowedPages.find((page) => page.key === selectedMenu);
    return selectedPage ? selectedPage.component : <div>Access Denied</div>;
  };

  const renderMenuItems = () => {
    if (!userInfo) return null;

    const userRole = userInfo?.role?.value; // Accessing user role from userInfo object
    const allowedPages = rolePermissions[userRole] || [];

    return (
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedMenu]}
        onClick={(e) => setSelectedMenu(e.key)}
        className="bg-white">
        {allowedPages.map((page) => (
          <Menu.Item key={page.key} icon={page.icon} className="bg-white">
            <span className="text-[#8ABF55] font-medium">{page.label}</span>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar for Desktop */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="site-layout-background hidden lg:block">
        <div className="logo-container py-2 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={collapsed ? 50 : 120}
            height={collapsed ? 25 : 40}
          />
        </div>

        {/* Render the menu items based on user role */}
        {renderMenuItems()}
      </Sider>

      {/* Drawer for Mobile */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={onClose}
        visible={visible}
        bodyStyle={{ padding: 0 }}>
        {/* Render the menu items in drawer for mobile */}
        {renderMenuItems()}
      </Drawer>

      <Layout className="site-layout">
        <Header className="bg-white flex justify-between items-center pr-8 py-4 shadow-md">
          <Button
            icon={<MenuOutlined />}
            className="lg:hidden"
            onClick={showDrawer}
          />
          <h1 className="text-2xl font-bold text-[#8ABF55] px-2">
            Fast Track Booking
          </h1>
          <div className="flex items-center space-x-4">
            {userInfo && (
              <div className="relative flex items-center space-x-2">
                <div className="hidden lg:block xl:block">
                  <Avatar
                    src={userInfo.image}
                    alt={userInfo.username}
                    size={40}
                  />
                </div>
                <div className="hidden lg:block xl:lg:block absolute top-0 left-0 mt-12 ml-2 bg-white text-[#8ABF55] rounded-md p-2 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  {userInfo.username}
                </div>
              </div>
            )}
            <Button
              icon={<LogoutOutlined />}
              type="primary"
              className="bg-[#8ABF55] text-white border-none hover:bg-[#7DA54E]"
              onClick={handleLogout}
            />
          </div>
        </Header>

        <Content className="m-6 p-6 bg-white rounded-lg shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            renderContent()
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

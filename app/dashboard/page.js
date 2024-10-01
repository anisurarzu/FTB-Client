"use client";

import { Layout, Menu, Button, Spin, Drawer, Avatar } from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  MenuOutlined,
} from "@ant-design/icons"; // Updated icons
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
      setUserInfo(JSON.parse(storedUserInfo));
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
    switch (selectedMenu) {
      case "1":
        return <DashboardHome />;
      case "2":
        return <AgentInformation />;
      case "3":
        return <HotelCategory />;
      case "4":
        return <HotelRoom />;
      case "5":
        return <HotelInformation />;
      case "6":
        return <BookingInfo />;
      case "7":
        return <Calender />;
      default:
        return (
          <div className="text-gray-900 text-lg font-medium">
            Welcome to your dashboard! This is the main content area where you
            can add your dashboard widgets, charts, and more.
          </div>
        );
    }
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
            width={collapsed ? 50 : 90}
            height={collapsed ? 25 : 30}
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={(e) => setSelectedMenu(e.key)}
          className="bg-white">
          <Menu.Item
            key="1"
            icon={<DashboardOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Dashboard</span>
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<UsergroupAddOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Users</span>
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<ApartmentOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Flat Type</span>
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<UnorderedListOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Flat No/Unit</span>
          </Menu.Item>
          <Menu.Item
            key="5"
            icon={<FileTextOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Hotel Info</span>
          </Menu.Item>
          <Menu.Item
            key="6"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Booking Info</span>
          </Menu.Item>
          <Menu.Item
            key="7"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Calendar</span>
          </Menu.Item>
          <Menu.Item
            key="8"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Settings</span>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Drawer for Mobile */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={onClose}
        visible={visible}
        bodyStyle={{ padding: 0 }}>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={(e) => {
            setSelectedMenu(e.key);
            onClose();
          }}
          className="bg-white">
          <Menu.Item
            key="1"
            icon={<DashboardOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Dashboard</span>
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<UsergroupAddOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Users</span>
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<ApartmentOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Flat Type</span>
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<UnorderedListOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Flat No/Unit</span>
          </Menu.Item>
          <Menu.Item
            key="5"
            icon={<FileTextOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Hotel Info</span>
          </Menu.Item>

          <Menu.Item
            key="6"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Booking Info</span>
          </Menu.Item>
          <Menu.Item
            key="7"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Calendar</span>
          </Menu.Item>
          <Menu.Item
            key="8"
            icon={<SettingOutlined style={{ color: "#8ABF55" }} />}
            className="bg-white">
            <span className="text-[#8ABF55] font-medium">Settings</span>
          </Menu.Item>
        </Menu>
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

"use client";

import {
  Layout,
  Menu,
  Button,
  Spin,
  Drawer,
  Avatar,
  Skeleton,
  theme,
} from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import DashboardHome from "@/component/DashboardHome";
import AgentInformation from "@/component/AgentInformation";
import HotelCategory from "@/component/HotelCategory";
import HotelInformation from "@/component/HotelInformation";
import HotelRoom from "@/component/HotelRoom";
import BookingInfo from "@/component/BookingInfo";
import Calender from "@/component/Calender";
import RoomAvailabilityPage from "@/component/RoomSearchPage";
import AllBookingInfo from "@/component/AllBookingInfo";
import ExpenseInfo from "@/component/Expense/ExpenseInfo";
import DailyStatement from "@/component/DailyStatement";
import PermissionManagement from "@/component/Permission/PermissionManagement";

const { Header, Sider, Content } = Layout;
const { useToken } = theme;

const rolePermissions = {
  superadmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: (props) => <DashboardHome {...props} />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <CalendarOutlined />,
      component: (props) => <Calender {...props} />,
    },
    {
      key: "9",
      label: "Room Availability",
      icon: <DashboardOutlined />,
      component: (props) => <RoomAvailabilityPage {...props} />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <InfoCircleOutlined />,
      component: (props) => <BookingInfo {...props} />,
    },
    {
      key: "12",
      label: "Daily Statement",
      icon: <InfoCircleOutlined />,
      component: (props) => <DailyStatement {...props} />,
    },
    {
      key: "10",
      label: "Report Dashboard",
      icon: <InfoCircleOutlined />,
      component: (props) => <AllBookingInfo {...props} />,
    },
    {
      key: "100",
      label: "Expense",
      icon: <InfoCircleOutlined />,
      component: <ExpenseInfo />,
    },
    {
      key: "5",
      label: "Hotel Info",
      icon: <FileTextOutlined />,
      component: <HotelInformation />,
    },
    {
      key: "2",
      label: "Users",
      icon: <UsergroupAddOutlined />,
      component: <AgentInformation />,
    },
    {
      key: "8",
      label: "Settings",
      icon: <SettingOutlined />,
      component: <PermissionManagement />,
    },
  ],
  agentadmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: (props) => <DashboardHome {...props} />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <CalendarOutlined />,
      component: (props) => <Calender {...props} />,
    },
    {
      key: "9",
      label: "Room Availability",
      icon: <DashboardOutlined />,
      component: (props) => <RoomAvailabilityPage {...props} />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <InfoCircleOutlined />,
      component: (props) => <BookingInfo {...props} />,
    },
  ],
  hoteladmin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: (props) => <DashboardHome {...props} />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <CalendarOutlined />,
      component: (props) => <Calender {...props} />,
    },
    {
      key: "9",
      label: "Room Availability",
      icon: <DashboardOutlined />,
      component: (props) => <RoomAvailabilityPage {...props} />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <InfoCircleOutlined />,
      component: (props) => <BookingInfo {...props} />,
    },
  ],
  admin: [
    {
      key: "1",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      component: (props) => <DashboardHome {...props} />,
    },
    {
      key: "9",
      label: "Room Availability",
      icon: <DashboardOutlined />,
      component: (props) => <RoomAvailabilityPage {...props} />,
    },
    {
      key: "7",
      label: "Calendar",
      icon: <CalendarOutlined />,
      component: (props) => <Calender {...props} />,
    },
    {
      key: "6",
      label: "Booking Info",
      icon: <SettingOutlined />,
      component: (props) => <BookingInfo {...props} />,
    },
    {
      key: "10",
      label: "Report Dashboard",
      icon: <InfoCircleOutlined />,
      component: (props) => <AllBookingInfo {...props} />,
    },
    {
      key: "5",
      label: "Hotel Info",
      icon: <FileTextOutlined />,
      component: <HotelInformation />,
    },
    {
      key: "2",
      label: "Users",
      icon: <UsergroupAddOutlined />,
      component: <AgentInformation />,
    },
  ],
};

const DashboardContent = ({ sliders }) => {
  const { token } = useToken();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Get hotelID from URL
  const hotelID = searchParams.get("hotelID");

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

    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [router, selectedMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    router.push("/login");
  };

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      );
    }

    const userRole = userInfo?.role?.value;
    const allowedPages = rolePermissions[userRole] || [];
    const selectedPage = allowedPages.find((page) => page.key === selectedMenu);

    if (selectedPage) {
      // Pass hotelID to components that need it
      if (typeof selectedPage.component === "function") {
        return selectedPage.component({ hotelID });
      }
      return selectedPage.component;
    }

    return <div>Access Denied</div>;
  };

  const renderMenuItems = () => {
    if (!userInfo) return null;

    const userRole = userInfo?.role?.value;
    const allowedPages = rolePermissions[userRole] || [];

    return (
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedMenu]}
        onClick={(e) => setSelectedMenu(e.key)}
        style={{ background: token.colorBgContainer }}
        className="border-r-0"
      >
        {allowedPages.map((page) => (
          <Menu.Item
            key={page.key}
            icon={page.icon}
            style={{
              margin: "4px 8px",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
            }}
          >
            {page.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Slim Sidebar - 200px width */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        breakpoint="lg"
        collapsedWidth={80}
        style={{
          background: token.colorBgContainer,
          boxShadow: "2px 0 8px rgba(29, 35, 41, 0.05)",
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
        className="hidden lg:block"
      >
        <div className="flex items-center justify-center py-4 h-16">
          <Image
            src="/images/new-logo.png"
            alt="Logo"
            width={collapsed ? 40 : 120}
            height={collapsed ? 20 : 30}
            className="transition-all duration-200"
          />
        </div>
        {renderMenuItems()}
      </Sider>

      <Layout>
        <Header
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            padding: "0 24px",
            height: "64px",
            lineHeight: "64px",
          }}
          className="flex justify-between items-center shadow-sm"
        >
          <div className="flex items-center">
            <Button
              type="text"
              icon={
                <MenuOutlined style={{ color: "white", fontSize: "16px" }} />
              }
              onClick={showDrawer}
              className="lg:hidden mr-2"
            />
            <h1 className="text-xl font-semibold text-white m-0">
              Fast Track Booking
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {userInfo && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={userInfo.image}
                  alt={userInfo.username}
                  size="default"
                  style={{ backgroundColor: "#8B5CF6" }}
                />
                <span className="text-white hidden md:inline">
                  {userInfo.username}
                </span>
              </div>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined style={{ color: "white" }} />}
              onClick={handleLogout}
              className="flex items-center"
            >
              <span className="text-white hidden md:inline">Logout</span>
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadow,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>

      {/* Mobile Drawer - Also 200px width */}
      <Drawer
        open={visible}
        onClose={onClose}
        placement="left"
        width={200}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ padding: "16px" }}
        title={
          <Image src="/images/logo.png" alt="Logo" width={120} height={30} />
        }
      >
        {renderMenuItems()}
      </Drawer>
    </Layout>
  );
};

const Dashboard = ({ sliders }) => {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent sliders={sliders} />
    </Suspense>
  );
};

export default Dashboard;

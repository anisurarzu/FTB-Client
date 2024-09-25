"use client";

import { Card, Col, Row, Statistic, Typography, Divider } from "antd";
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/charts";

const { Title } = Typography;

const DashboardHome = () => {
  // Example data for the chart
  const data = [
    { month: "Jan", sales: 1000 },
    { month: "Feb", sales: 1200 },
    { month: "Mar", sales: 1100 },
    { month: "Apr", sales: 1300 },
    { month: "May", sales: 1400 },
    { month: "Jun", sales: 1600 },
  ];

  const config = {
    data,
    xField: "month",
    yField: "sales",
    point: {
      size: 5,
      shape: "diamond",
    },
    smooth: true,
  };

  return (
    <div className="">
      {/* Title */}
      <Title
        level={2}
        className="mb-4 lg:mb-6 text-[#8ABF55] text-center lg:text-left">
        Dashboard Overview
      </Title>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={1200}
              prefix={<ShoppingCartOutlined style={{ color: "#8ABF55" }} />}
              valueStyle={{ color: "#8ABF55" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={54000}
              prefix={<DollarCircleOutlined style={{ color: "#8ABF55" }} />}
              valueStyle={{ color: "#8ABF55" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={320}
              prefix={<UsergroupAddOutlined style={{ color: "#8ABF55" }} />}
              valueStyle={{ color: "#8ABF55" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Graph */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg">
        <Title
          level={4}
          className="text-[#8ABF55] mb-4 text-center lg:text-left">
          Sales Over Time
        </Title>
        <Line {...config} />
      </div>

      {/* Additional Information */}
      <Divider className="my-4 lg:my-6" />
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Title level={5}>Recent Orders</Title>
            {/* Add recent orders or any additional data here */}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Title level={5}>Upcoming Events</Title>
            {/* Add upcoming events or any additional data here */}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Title level={5}>System Health</Title>
            {/* Add system health or any additional data here */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;

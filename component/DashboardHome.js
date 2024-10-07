"use client";
import { useState, useEffect } from "react";
import { Card, Col, Row, Statistic, Typography, Divider } from "antd";
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  UsergroupAddOutlined,
  InfoCircleOutlined,
  FundOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  FieldTimeOutlined,
  UserDeleteOutlined,
  MoneyCollectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import coreAxios from "@/utils/axiosInstance";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
const { Title } = Typography;

const DashboardHome = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("bookings");
      if (response.status === 200) {
        setBookings(response?.data);
        setLoading(false);
      }
    } catch (error) {
      message.error("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  /* total bookings ftb today */

  // Step 1: Get today's date in the desired format (e.g., "2 Oct 2024")
  const today = dayjs().format("D MMM YYYY");

  // Step 2: Filter bookings based on createTime being today and other conditions
  const filteredTodayBookings = bookings.filter((booking) => {
    // Convert the booking's createTime to the desired format
    const createTime = dayjs(booking.createTime).format("D MMM YYYY");

    return (
      createTime === today && // Check if the booking was created today
      booking.bookedBy !== "SBFrontDeskFTB" && // Exclude bookings by SBFrontDeskFTB
      booking.statusID !== 255 // Exclude bookings with statusID 255
    );
  });

  // Step 3: Calculate the total bill for today's filtered bookings
  const totalBillForToday = filteredTodayBookings.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );

  /* all time bokings amount for all */

  // Step 1: Filter out bookings where bookedBy is 'SBFrontDeskFTB'
  const filteredBookings = bookings.filter(
    (booking) =>
      /* booking.bookedBy !== "SBFrontDeskFTB" && */ booking.statusID !== 255
  );

  // Step 2: Calculate the total bill of the filtered bookings
  const totalBill = filteredBookings.reduce((acc, booking) => {
    return acc + booking.totalBill;
  }, 0);

  /* last 30 days ftb's booking amount */

  // Step 1: Get today's date and the date 30 days ago
  // Import the isBetween plugin

  // Extend dayjs with the isBetween plugin
  dayjs.extend(isBetween);
  const thirtyDaysAgo = dayjs().subtract(30, "day");

  // Step 2: Filter bookings created within the last 30 days and apply the other conditions
  const filteredLast30DaysBookings = bookings.filter((booking) => {
    // Convert the booking's createTime to a dayjs object
    const createTime = dayjs(booking.createTime);

    // Check if the booking was created within the last 30 days
    return (
      createTime.isBetween(thirtyDaysAgo, today, "day", "[]") && // Booking within the last 30 days (inclusive)
      booking.bookedBy !== "SBFrontDeskFTB" && // Exclude bookings by SBFrontDeskFTB
      booking.statusID !== 255 // Exclude bookings with statusID 255
    );
  });

  // Step 3: Calculate the total bill for the filtered bookings
  const totalBillForLast30Days = filteredLast30DaysBookings.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );
  /* last 30 days ftb's booking amount */

  // Step 1: Get today's date and the date 30 days ago
  // Import the isBetween plugin

  // Extend dayjs with the isBetween plugin

  const thirtyDaysAgo2 = dayjs().subtract(30, "day");

  // Step 2: Filter bookings created within the last 30 days and apply the other conditions
  const filteredLast30DaysBookings2 = bookings.filter((booking) => {
    // Convert the booking's createTime to a dayjs object
    const createTime = dayjs(booking.createTime);

    // Check if the booking was created within the last 30 days
    return (
      createTime.isBetween(thirtyDaysAgo, today, "day", "[]") && // Booking within the last 30 days (inclusive)
      // Exclude bookings by SBFrontDeskFTB
      booking.statusID !== 255 // Exclude bookings with statusID 255
    );
  });

  // Step 3: Calculate the total bill for the filtered bookings
  const totalBillForLast30Days2 = filteredLast30DaysBookings.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );

  const generateMonthlyBillData = (data) => {
    const monthlyTotals = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    data.forEach((booking) => {
      // Parse the check-in date
      const checkInDate = new Date(booking.checkInDate);
      const month = checkInDate.toLocaleString("default", { month: "short" }); // Get the short month name
      const totalBill = booking.totalBill;

      // Accumulate the total bill for the month
      monthlyTotals[month] += totalBill;
    });

    // Convert the monthlyTotals object to an array
    const result = Object.entries(monthlyTotals).map(([month, totalBill]) => ({
      month,
      totalBill,
    }));

    return result;
  };

  const monthlyBillData = generateMonthlyBillData(filteredBookings);
  console.log("data------", monthlyBillData);

  const data = [
    { month: "Jan", sales: 1000 },
    { month: "Feb", sales: 1200 },
    { month: "Mar", sales: 1100 },
    { month: "Apr", sales: 1300 },
    { month: "May", sales: 1400 },
    { month: "Jun", sales: 1600 },
  ];

  const config = {
    data: monthlyBillData,
    xField: "month",
    yField: "totalBill",
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      // Ensure that the label uses the correct field
      content: (data) => `${data.totalBill}`, // Display total bill value
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
      <Row gutter={[16, 24]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={
                <span style={{ color: "white" }}>
                  {"FTB's Booking For Today"}
                </span>
              }
              value={totalBillForToday}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={
                <span style={{ color: "white" }}>Room vacany for today</span>
              }
              value={320}
              prefix={<HomeOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={
                <span style={{ color: "white" }}>
                  Last 30 days booking amount FTB
                </span>
              }
              value={totalBillForLast30Days}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={
                <span style={{ color: "white" }}>
                  Last 30 days booking amount
                </span>
              }
              value={totalBillForLast30Days2}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={
                <span style={{ color: "white" }}>Total booking Amount</span>
              }
              value={totalBill}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>
        {/* <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ backgroundColor: "#8ABF55" }}>
            <Statistic
              title={<span style={{ color: "white" }}>Total Users</span>}
              value={10}
              prefix={<UserOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col> */}
      </Row>

      {/* Graph */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg mt-2">
        <Title
          level={4}
          className="text-[#8ABF55] mb-4 text-center lg:text-left">
          Bookings Over Time
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

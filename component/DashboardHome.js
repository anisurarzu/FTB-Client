import { useState, useEffect } from "react";
import { Card, Col, Row, Typography, Select, message, Skeleton } from "antd";
import coreAxios from "@/utils/axiosInstance";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Formik, Form, Field } from "formik";
import UserBookingInfo from "./UserBookingInfo";
import NoPermissionBanner from "./Permission/NoPermissionBanner";

const { Title, Text } = Typography;
const { Option } = Select;

// Unicode icon components
const UserIcon = () => <span style={{ fontSize: '20px' }}>👤</span>;
const TeamIcon = () => <span style={{ fontSize: '20px' }}>👥</span>;
const CalendarIcon = () => <span style={{ fontSize: '20px' }}>📅</span>;
const MoneyIcon = () => <span style={{ fontSize: '20px' }}>💰</span>;
const ArrowUpIcon = () => <span style={{ fontSize: '16px' }}>↗️</span>;
const ArrowDownIcon = () => <span style={{ fontSize: '16px' }}>↘️</span>;

const DashboardHome = ({ hotelID }) => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const defaultHotelID = "";
  const [userData, setUserData] = useState([]);
  const [selectedHotelID, setSelectedHotelID] = useState(hotelID);

  // Retrieve user information from local storage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userHotelID = hotelID;
  const permission = userInfo?.permission?.permissions;
  const dashboardPermissions =
    permission?.find((perm) => perm.pageName === "Dashboard") || {};

  useEffect(() => {
    fetchHotelInfo();
    fetchUsers();
    fetchBookingsByHotelID(selectedHotelID);
  }, [selectedHotelID]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const response = await coreAxios.get("/auth/users");

      if (response.status === 200) {
        console.log("Users fetched successfully:", response.data);
        setUsers(response.data);
        const allUsers = response.data;

        console.log(
          "Selected Hotel ID:",
          selectedHotelID,
          typeof selectedHotelID
        );
        console.log("All users before filtering:", allUsers.users);

        // Filter users based on selected hotelID
        const filtered = allUsers.users?.filter((user) => {
          console.log("--- Checking user:", user.loginID);
          console.log("User hotelIDs:", user.hotelID, typeof user.hotelID?.[0]);

          const hasHotel =
            Array.isArray(user.hotelID) &&
            user.hotelID.includes(Number(selectedHotelID));

          console.log("Does user have selected hotel?", hasHotel);
          return hasHotel;
        });

        console.log("Filtered users:", filtered);
        setFilteredUsers(filtered || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log("Filtered Users:", filteredUsers);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("bookings");
      if (response.status === 200) {
        setBookings(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByHotelID = async (hotelID) => {
    setLoading2(true);
    try {
      const response = await coreAxios.post("getBookingByHotelID", {
        hotelID: hotelID,
      });
      if (response.status === 200) {
        const filtered = response?.data?.filter(
          (data) => data.statusID !== 255
        );
        setFilteredBookings(filtered);
      }
    } catch (error) {
      setFilteredBookings([]);
      message.error("No Bookings Presents For This Hotel.");
    } finally {
      setLoading2(false);
    }
  };

  const fetchHotelInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userRole = userInfo?.role?.value;
      const userHotelID = Number(hotelID);

      const response = await coreAxios.get("hotel");

      if (Array.isArray(response.data)) {
        let filteredHotels = response.data;

        if (userRole !== "superadmin" && userHotelID) {
          filteredHotels = filteredHotels.filter(
            (hotel) => hotel.hotelID === userHotelID
          );
        }

        setHotelInfo(filteredHotels);
      } else {
        setHotelInfo([]);
      }
    } catch (error) {
      message.error("Failed to fetch hotel information.");
    }
  };

  console.log("hotelInfo:", hotelInfo);

  const today = dayjs().format("D MMM YYYY");

  // Filter bookings based on selected hotel ID
  const filteredTodayBookingsFTB = filteredBookings.filter((booking) => {
    const createTime = dayjs(booking.createTime).format("D MMM YYYY");
    return createTime === today && booking.bookedByID !== "SBFrontDesk";
  });

  const filteredTodayBookingsByEveryOne = filteredBookings.filter((booking) => {
    const createTime = dayjs(booking.createTime).format("D MMM YYYY");
    return createTime === today;
  });

  const totalBillForTodayByFTB = filteredTodayBookingsFTB.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );

  const totalBillForTodayByEveryOne = filteredTodayBookingsByEveryOne.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );

  const totalBill = filteredBookings.reduce((acc, booking) => {
    return acc + booking.totalBill;
  }, 0);

  dayjs.extend(isBetween);
  const thirtyDaysAgo = dayjs().subtract(30, "day");

  const filteredLast30DaysBookingsByFTB = filteredBookings.filter((booking) => {
    const createTime = dayjs(booking.createTime);
    return (
      createTime.isBetween(thirtyDaysAgo, today, "day", "[]") &&
      booking.bookedByID !== "SBFrontDesk"
    );
  });
  const filteredLast30DaysBookingsByEveryOne = filteredBookings.filter(
    (booking) => {
      const createTime = dayjs(booking.createTime);
      return createTime.isBetween(thirtyDaysAgo, today, "day", "[]");
    }
  );

  const totalBillForLast30DaysByFTB = filteredLast30DaysBookingsByFTB.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );
  const totalBillForLast30DaysByEveryOne =
    filteredLast30DaysBookingsByEveryOne.reduce(
      (sum, booking) => sum + booking.totalBill,
      0
    );

  // Get count of bookings instead of percentage
  const getBookingCount = (bookings) => {
    return bookings.length;
  };

  const getIconForStat = (label) => {
    switch (label) {
      case "Today's FTB Bookings":
        return <UserIcon />;
      case "Today's All Bookings":
        return <TeamIcon />;
      case "30 Days FTB Bookings":
        return <CalendarIcon />;
      case "30 Days All Bookings":
        return <MoneyIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  const getColorForStat = (label) => {
    switch (label) {
      case "Today's FTB Bookings":
        return "#2563eb"; // Blue-600
      case "Today's All Bookings":
        return "#1d4ed8"; // Blue-700
      case "30 Days FTB Bookings":
        return "#1e40af"; // Blue-800
      case "30 Days All Bookings":
        return "#1e3a8a"; // Blue-900
      default:
        return "#2563eb"; // Blue-600
    }
  };

  const calculateUserTotalBills = (userID) => {
    const user = filteredUsers?.find((user) => user.id === userID);

    if (!user) {
      return {
        totalBillForUserToday: 0,
        totalBillForUserLast7Days: 0,
        totalBillForUserLast30Days: 0,
        totalBillForUserOverall: 0,
      };
    }

    const bookedByID = user.loginID;
    const userBookings = filteredBookings.filter(
      (booking) => booking.bookedByID === bookedByID
    );

    const today = dayjs().startOf("day");
    const totalBillForUserToday = userBookings.reduce((sum, booking) => {
      const createTime = dayjs(booking.createTime).startOf("day");
      return createTime.isSame(today) ? sum + booking.totalBill : sum;
    }, 0);

    const sevenDaysAgo = dayjs().subtract(7, "day").startOf("day");
    const totalBillForUserLast7Days = userBookings.reduce((sum, booking) => {
      const createTime = dayjs(booking.createTime).startOf("day");
      return createTime.isBetween(sevenDaysAgo, today, "day", "[]")
        ? sum + booking.totalBill
        : sum;
    }, 0);

    const thirtyDaysAgo = dayjs().subtract(30, "day").startOf("day");
    const totalBillForUserLast30Days = userBookings.reduce((sum, booking) => {
      const createTime = dayjs(booking.createTime).startOf("day");
      return createTime.isBetween(thirtyDaysAgo, today, "day", "[]")
        ? sum + booking.totalBill
        : sum;
    }, 0);

    const totalBillForUserOverall = userBookings.reduce(
      (sum, booking) => sum + booking.totalBill,
      0
    );

    return {
      totalBillForUserToday,
      totalBillForUserLast7Days,
      totalBillForUserLast30Days,
      totalBillForUserOverall,
    };
  };

  const userTableData = filteredUsers?.map((user) => {
    const {
      totalBillForUserToday,
      totalBillForUserLast7Days,
      totalBillForUserLast30Days,
      totalBillForUserOverall,
    } = calculateUserTotalBills(user.id);
    return {
      key: user.id,
      username: user.loginID,
      totalBillForTodayByFTB: totalBillForUserToday,
      totalBillForUserLast7Days: totalBillForUserLast7Days,
      totalBillForLast30DaysByFTB: totalBillForUserLast30Days,
      totalBillOverall: totalBillForUserOverall,
    };
  });

  return (
    <div>
      {dashboardPermissions.viewAccess ? (
        <>
          <div className="p-6 bg-blue-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Dashboard Overview
              </h1>
              <p className="text-slate-600">
                Welcome back to Fast Track Booking - Monitor your hotel performance
              </p>
            </div>

            {/* Hotel Selection */}
            <Formik
              initialValues={{ hotelID: selectedHotelID || 0 }}
              onSubmit={(values) => {}}
            >
              {({ setFieldValue, values }) => (
                <Form>
                  <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-blue-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Hotel
                    </label>
                    <Field name="hotelID">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Choose a hotel to view analytics"
                          value={values.hotelID}
                          style={{ width: 300 }}
                          size="large"
                          onChange={(value) => {
                            setSelectedHotelID(value);
                            setFieldValue("hotelID", value);
                            fetchBookingsByHotelID(value);
                          }}
                          className="hotel-selector"
                        >
                          {hotelInfo.map((hotel) => (
                            <Option key={hotel.hotelID} value={hotel.hotelID}>
                              {hotel.hotelName}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Field>
                  </div>
                </Form>
              )}
            </Formik>

            {loading2 ? (
              <Row gutter={[24, 24]}>
                {[1, 2, 3, 4].map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item}>
                    <Card
                      hoverable
                      bordered={false}
                      className="rounded-xl overflow-hidden border-0 h-full bg-white shadow-sm"
                    >
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div>
                {/* Stats Cards */}
                <Row gutter={[24, 24]}>
                  {[
                    {
                      label: "Today's FTB Bookings",
                      value: totalBillForTodayByFTB,
                      count: getBookingCount(filteredTodayBookingsFTB),
                      icon: <UserIcon />,
                      description: "Bookings via Fast Track Booking today"
                    },
                    {
                      label: "Today's All Bookings",
                      value: totalBillForTodayByEveryOne,
                      count: getBookingCount(filteredTodayBookingsByEveryOne),
                      icon: <TeamIcon />,
                      description: "All bookings including front desk"
                    },
                    {
                      label: "30 Days FTB Bookings",
                      value: totalBillForLast30DaysByFTB,
                      count: getBookingCount(filteredLast30DaysBookingsByFTB),
                      icon: <CalendarIcon />,
                      description: "FTB bookings in last 30 days"
                    },
                    {
                      label: "30 Days All Bookings",
                      value: totalBillForLast30DaysByEveryOne,
                      count: getBookingCount(
                        filteredLast30DaysBookingsByEveryOne
                      ),
                      icon: <MoneyIcon />,
                      description: "All bookings in last 30 days"
                    },
                  ].map((item, idx) => {
                    const color = getColorForStat(item.label);
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                        <Card
                          hoverable
                          bordered={false}
                          className="rounded-xl overflow-hidden border-0 h-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          style={{ 
                            background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                            border: `1px solid ${color}33`
                          }}
                          bodyStyle={{ padding: "24px" }}
                        >
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-white/20">
                                  {item.icon}
                                </div>
                                <Text
                                  className="text-sm font-semibold uppercase tracking-wide"
                                  style={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: "0.75rem",
                                    letterSpacing: "0.05em"
                                  }}
                                >
                                  {item.label}
                                </Text>
                              </div>
                              
                              <Title
                                level={2}
                                className="mt-1 mb-2"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 700,
                                  fontSize: "1.75rem",
                                  color: "white",
                                  lineHeight: "1.2"
                                }}
                              >
                                {typeof item.value === "number"
                                  ? `৳${item.value.toLocaleString()}`
                                  : item.value}
                              </Title>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <Text
                                    style={{
                                      color: "rgba(255,255,255,0.8)",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "0.875rem",
                                      fontWeight: 500
                                    }}
                                  >
                                    {item.count} bookings
                                  </Text>
                                  <div className="mt-1">
                                    <Text
                                      style={{
                                        color: "rgba(255,255,255,0.7)",
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {item.description}
                                    </Text>
                                  </div>
                                </div>
                                <div className="text-white opacity-80">
                                  <ArrowUpIcon />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {/* User Booking Info Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                  <div className="p-6 border-b border-blue-200">
                    <Title level={4} className="m-0 text-slate-800">
                      User-wise Booking Overview
                    </Title>
                    <Text className="text-slate-600">
                      Detailed breakdown of bookings by each user
                    </Text>
                  </div>
                  <UserBookingInfo
                    userTableData={userTableData}
                    title={""}
                    loading={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <style jsx>{`
            .hotel-selector .ant-select-selector {
              border-radius: 8px !important;
              border: 1px solid #d1d5db !important;
              transition: all 0.3s ease !important;
            }
            
            .hotel-selector .ant-select-selector:hover {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .hotel-selector .ant-select-selector:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
          `}</style>
        </>
      ) : (
        <>
          <NoPermissionBanner />
        </>
      )}
    </div>
  );
};

export default DashboardHome;
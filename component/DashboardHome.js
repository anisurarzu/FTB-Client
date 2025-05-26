import { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Select,
  message,
  Skeleton,
} from "antd";
import { 
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import coreAxios from "@/utils/axiosInstance";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Formik, Form, Field } from "formik";
import UserBookingInfo from "./UserBookingInfo";

const { Title, Text } = Typography;
const { Option } = Select;

const DashboardHome = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const defaultHotelID = "";
  const [userData, setUserData] = useState([]);

  // Retrieve user information from local storage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Extract the hotelID if it exists in userInfo
  const userHotelID = userInfo?.hotelID;

  useEffect(() => {
    fetchHotelInfo();
    fetchUsers();
    fetchBookingsByHotelID(userHotelID);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await coreAxios.get("/auth/users");
      if (response.status === 200) {
        setUsers(response.data);
        const allUsers = response.data;

        if (userInfo?.role?.value === "agentadmin") {
          const filtered = allUsers.users?.filter(
            (user) =>
              user.role.value !== "superadmin" && user.role.value !== "admin"
          );
          setFilteredUsers(filtered);
        } else if (userInfo?.role?.value === "superadmin") {
          const filtered = allUsers.users?.filter(
            (user) =>
              user.role.value !== "superadmin" && user.role.value !== "admin"
          );
          setFilteredUsers(filtered);
        } else {
          const filtered = allUsers.users?.filter((user) => {
            if (
              user.role.value === "superadmin" ||
              user.role.value === "admin"
            ) {
              return false;
            }

            if (
              userInfo.role.value === "hoteladmin" &&
              user.loginID === userInfo.loginID
            ) {
              return true;
            }

            return user.role.value !== "hoteladmin";
          });
          setFilteredUsers(filtered);
        }
      }
    } catch (error) {
      message.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      const userHotelID = userInfo?.hotelID;

      const response = await coreAxios.get("hotel");

      if (Array.isArray(response.data)) {
        let filteredHotels = response.data;

        if (userRole === "hoteladmin" && userHotelID) {
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
        return <UserOutlined style={{ fontSize: '20px' }} />;
      case "Today's All Bookings":
        return <TeamOutlined style={{ fontSize: '20px' }} />;
      case "30 Days FTB Bookings":
        return <CalendarOutlined style={{ fontSize: '20px' }} />;
      case "30 Days All Bookings":
        return <DollarOutlined style={{ fontSize: '20px' }} />;
      default:
        return <DollarOutlined style={{ fontSize: '20px' }} />;
    }
  };

  const getColorForStat = (label) => {
    switch (label) {
      case "Today's FTB Bookings":
        return "#6366F1"; // Indigo
      case "Today's All Bookings":
        return "#10B981"; // Emerald
      case "30 Days FTB Bookings":
        return "#F59E0B"; // Amber
      case "30 Days All Bookings":
        return "#EF4444"; // Red
      default:
        return "#8B5CF6"; // Violet
    }
  };

  const getCardBackground = (color) => {
    return {
      background: `linear-gradient(135deg, ${color} 0%, ${lightenColor(color, 20)} 100%)`,
      color: 'white',
    };
  };

  const lightenColor = (color, percent) => {
    // Simple color lightening function
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
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
    <div className="p-4 bg-gray-50 min-h-screen">
      <Formik
        initialValues={{ hotelID: userHotelID || 0 }}
        onSubmit={(values) => {}}>
        {({ setFieldValue, values }) => (
          <Form>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <Field name="hotelID">
                {({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a Hotel"
                    value={values.hotelID}
                    style={{ width: 300 }}
                    onChange={(value) => {
                      setFieldValue("hotelID", value);
                      fetchBookingsByHotelID(value);
                    }}>
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

     {/*  <Title level={2} className="mb-6 text-gray-800">
        Dashboard Overview
      </Title> */}

      {loading2 ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item}>
              <Card
                hoverable
                bordered={false}
                className="rounded-xl overflow-hidden border-0 h-full">
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div>
          <Row gutter={[24, 24]}>
            {[
              {
                label: "Today's FTB Bookings",
                value: totalBillForTodayByFTB,
                count: getBookingCount(filteredTodayBookingsFTB),
                icon: <UserOutlined />,
              },
              {
                label: "Today's All Bookings",
                value: totalBillForTodayByEveryOne,
                count: getBookingCount(filteredTodayBookingsByEveryOne),
                icon: <TeamOutlined />,
              },
              {
                label: "30 Days FTB Bookings",
                value: totalBillForLast30DaysByFTB,
                count: getBookingCount(filteredLast30DaysBookingsByFTB),
                icon: <CalendarOutlined />,
              },
              {
                label: "30 Days All Bookings",
                value: totalBillForLast30DaysByEveryOne,
                count: getBookingCount(filteredLast30DaysBookingsByEveryOne),
                icon: <DollarOutlined />,
              },
            ].map((item, idx) => {
              const color = getColorForStat(item.label);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                  <Card
                    hoverable
                    bordered={false}
                    className="rounded-xl overflow-hidden border-0 h-full shadow-sm"
                    style={getCardBackground(color)}
                    bodyStyle={{ padding: "20px" }}>
                    <div className="flex items-start justify-between h-full">
                      <div>
                        <Text
                          className="text-sm uppercase tracking-wider"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.8)',
                          }}>
                          {item.label}
                        </Text>
                        <Title
                          level={2}
                          className="mt-1 mb-0"
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 600,
                            fontSize: "1.75rem",
                            color: 'white',
                          }}>
                          {typeof item.value === "number"
                            ? `৳${item.value.toLocaleString()}`
                            : item.value}
                        </Title>
                        <div className="flex items-center mt-2">
                          <Text
                            style={{
                              color: 'rgba(255,255,255,0.9)',
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.875rem",
                            }}>
                            {item.count} bookings
                          </Text>
                        </div>
                      </div>
                      <div
                        className="p-3 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: `1px solid rgba(255,255,255,0.3)`,
                          width: "48px",
                          height: "48px",
                        }}>
                        {getIconForStat(item.label)}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="mt-8 bg-white  rounded-lg shadow-sm">
            <UserBookingInfo
              userTableData={userTableData}
              title={"User-wise Booking Overview"}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
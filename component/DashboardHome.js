import { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Alert,
  Spin,
  Select,
  message,
  Table,
} from "antd";
import { CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import coreAxios from "@/utils/axiosInstance";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Formik, Form, Field } from "formik";

const { Title } = Typography;
const { Option } = Select;

const DashboardHome = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [hotelInfo, setHotelInfo] = useState([]); // State for hotel information
  const [filteredBookings, setFilteredBookings] = useState([]); // State for filtered bookings
  const defaultHotelID = ""; // Default hotel ID
  const [userData, setUserData] = useState([]); // State for user data

  useEffect(() => {
    fetchBookings();
    fetchHotelInfo();
    fetchUsers();
    fetchBookingsByHotelID(21);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await coreAxios.get("/auth/users");
      if (response.status === 200) {
        setLoading(false);
        setUsers(response.data);
        const allUsers = response.data;

        // Filter out users with role "Super Admin" or "Admin"
        const filtered = allUsers.users?.filter(
          (user) =>
            user.role.value !== "superadmin" && user.role.value !== "admin"
        );

        setFilteredUsers(filtered);
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
      }); // Use POST and send hotelID in the body
      if (response.status === 200) {
        const filtered = response?.data?.filter(
          (data) => data.statusID !== 255
        );
        setFilteredBookings(filtered);
        setLoading2(false);
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
      const response = await coreAxios.get("hotel");
      if (Array.isArray(response.data)) {
        setHotelInfo(response.data);
        // handleHotelChange(7); // Initialize with default hotel ID
      } else {
        setHotelInfo([]); // or handle appropriately
      }
    } catch (error) {
      // message.error("Failed to fetch hotel information.");
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
  const totalBillForTodayByEveryOne = filteredTodayBookingsFTB.reduce(
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

    data?.forEach((booking) => {
      const createTime = new Date(booking.createTime);
      const month = createTime.toLocaleString("default", { month: "short" });
      const totalBill = booking.totalBill;

      monthlyTotals[month] += totalBill;
    });

    return Object.entries(monthlyTotals).map(([month, totalBill]) => ({
      month,
      totalBill,
    }));
  };

  const monthlyBillData = generateMonthlyBillData(filteredBookings);

  const lineChartConfig = {
    data: [],
    xField: "month",
    yField: "totalBill",
    point: {
      size: 5,
      shape: "diamond",
    },
    label: {
      content: (data) => `${data.totalBill}`,
    },
    smooth: true,
  };

  // Calculate user-wise total bills
  const calculateUserTotalBills = (userID) => {
    // Get the correct loginID based on userID
    const user = filteredUsers?.find((user) => user.id === userID);

    if (!user) {
      return {
        totalBillForUserToday: 0,
        totalBillForUserLast30Days: 0,
        totalBillForUserOverall: 0,
      };
    }

    const bookedByID = user.loginID; // Get the corresponding loginID

    // Filter bookings based on bookedByID
    const userBookings = filteredBookings.filter(
      (booking) => booking.bookedByID === bookedByID
    );

    // Log the user bookings to verify

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

  // Prepare user data for the table
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
      {loading ? (
        <Spin tip="Loading...">
          <Alert
            message="Alert message title"
            description="Further details about the context of this alert."
            type="info"
          />
        </Spin>
      ) : (
        <div>
          <div className="">
            <Formik
              initialValues={{ hotelID: 21 }} // Only hotelID in initial values
              onSubmit={(values) => {
                // Log selected value
                // Update filtered bookings based on selected hotel
              }}>
              {({ setFieldValue, values }) => (
                <Form>
                  <Field name="hotelID">
                    {({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select a Hotel"
                        value={values.hotelID} // Ensure Select shows the correct hotel ID
                        style={{ width: 300 }}
                        onChange={(value) => {
                          setFieldValue("hotelID", value);
                          fetchBookingsByHotelID(value);
                          // Update Formik state
                          // handleHotelChange(value); // Update filtered bookings
                        }}>
                        {hotelInfo.map((hotel) => (
                          <Option key={hotel.hotelID} value={hotel.hotelID}>
                            {hotel.hotelName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </Form>
              )}
            </Formik>
          </div>
          <Title
            level={2}
            className="mb-2 lg:mb-4 text-[#8ABF55] text-center lg:text-left">
            Dashboard Overview
          </Title>

          {loading2 ? (
            <Spin tip="Loading...">
              <Alert
                message="Alert message title"
                description="Further details about the context of this alert."
                type="info"
              />
            </Spin>
          ) : (
            <div>
              <Row gutter={[16, 24]} className="mb-6">
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      background: "linear-gradient(45deg, #8A99EB, #AFC7F3)",
                    }}>
                    <Statistic
                      title={
                        <span className="text-white">
                          {"Today's Booking By FTB Agents"}
                        </span>
                      }
                      value={totalBillForTodayByFTB}
                      prefix={<CheckCircleOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      background: "linear-gradient(45deg, #8A99EB, #AFC7F3)",
                    }}>
                    <Statistic
                      title={
                        <span className="text-white">
                          {"Today's Booking By FTB Everyone"}
                        </span>
                      }
                      value={totalBillForTodayByEveryOne}
                      prefix={<CheckCircleOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      background: "linear-gradient(45deg, #8A99EB, #AFC7F3)",
                    }}>
                    <Statistic
                      title={
                        <span className="text-white">
                          Last 30 Days Booking By FTB
                        </span>
                      }
                      value={totalBillForLast30DaysByFTB}
                      prefix={<CheckCircleOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      background: "linear-gradient(45deg, #8A99EB,  #AFC7F3)",
                    }}>
                    <Statistic
                      title={
                        <span className="text-white">
                          Last 30 Days Booking By Everyone
                        </span>
                      }
                      value={totalBillForLast30DaysByEveryOne}
                      prefix={<CheckCircleOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </Card>
                </Col>

                {/* <Col xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      background: "linear-gradient(45deg, #8A99EB, #AFC7F3)",
                    }}>
                    <Statistic
                      title={
                        <span className="text-white">
                          {`Today's Booking By Overall`}
                        </span>
                      }
                      value={totalBill}
                      prefix={<CheckCircleOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </Card>
                </Col> */}
              </Row>
              {/* <div className="">

                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg mt-2">
                  <Title
                    level={4}
                    className="text-[#8ABF55] mb-4 text-center lg:text-left">
                    Bookings Over Time
                  </Title>
                  <Line {...lineChartConfig} />
                </div>
              </div> */}
            </div>
          )}

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg mt-4">
            <Title
              level={4}
              className="text-[#8ABF55] mb-4 text-center lg:text-left">
              User-wise Booking Overview
            </Title>

            {/* Responsive Table */}
            <div className="relative overflow-x-auto shadow-md">
              <div style={{ overflowX: "auto" }}>
                <table className="w-full text-xs text-left rtl:text-right dark:text-gray-400">
                  {/* Table Header */}
                  <thead>
                    <tr style={{ backgroundColor: "#8CA0ED", color: "white" }}>
                      <th className="border border-tableBorder text-center p-2">
                        User ID
                      </th>
                      <th className="border border-tableBorder text-center p-2">
                        {`Today's Booking`}
                      </th>
                      <th className="border border-tableBorder text-center p-2">
                        Last 7 Days Booking
                      </th>
                      <th className="border border-tableBorder text-center p-2">
                        Last 30 Days Booking
                      </th>
                      <th className="border border-tableBorder text-center p-2">
                        Overall Booking
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {userTableData?.map((user, index) => (
                      <tr
                        key={user.key}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#9CDFFB" : "#ABCDF5",
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#8CA0ED")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? "#9CDFFB" : "#ABCDF5")
                        }>
                        <td className="border border-tableBorder text-center p-2">
                          {user.username}
                        </td>
                        <td className="border border-tableBorder text-center p-2">
                          {user.totalBillForTodayByFTB}
                        </td>
                        <td className="border border-tableBorder text-center p-2">
                          {user.totalBillForUserLast7Days}
                        </td>
                        <td className="border border-tableBorder text-center p-2">
                          {user.totalBillForLast30DaysByFTB}
                        </td>
                        <td className="border border-tableBorder text-center p-2">
                          {user.totalBillOverall}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

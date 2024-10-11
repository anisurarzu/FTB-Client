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
  const [loading, setLoading] = useState(false);
  const [hotelInfo, setHotelInfo] = useState([]); // State for hotel information
  const [filteredBookings, setFilteredBookings] = useState([]); // State for filtered bookings
  const defaultHotelID = ''; // Default hotel ID

  useEffect(() => {
    fetchBookings();
    fetchHotelInfo();
  }, []);

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

  const fetchHotelInfo = async () => {
    try {
      const response = await coreAxios.get("hotel");
      if (Array.isArray(response.data)) {
        setHotelInfo(response.data);
        handleHotelChange(7); // Initialize with default hotel ID
      } else {
        setHotelInfo([]); // or handle appropriately
      }
    } catch (error) {
      message.error("Failed to fetch hotel information.");
    }
  };

  const today = dayjs().format("D MMM YYYY");

  // Filter bookings based on selected hotel ID
  const handleHotelChange = (hotelID) => {
    const filteredData = bookings.filter(
      (booking) => booking.hotelID === hotelID && booking.statusID !== 255
    );
    setFilteredBookings(filteredData); // Update filtered bookings
  };

  const filteredTodayBookings = filteredBookings.filter((booking) => {
    const createTime = dayjs(booking.createTime).format("D MMM YYYY");
    return createTime === today && booking.bookedBy !== "SBFrontDeskFTB";
  });

  const totalBillForToday = filteredTodayBookings.reduce(
    (sum, booking) => sum + booking.totalBill,
    0
  );

  const totalBill = filteredBookings.reduce((acc, booking) => {
    return acc + booking.totalBill;
  }, 0);

  dayjs.extend(isBetween);
  const thirtyDaysAgo = dayjs().subtract(30, "day");

  const filteredLast30DaysBookings = filteredBookings.filter((booking) => {
    const createTime = dayjs(booking.createTime);
    return (
      createTime.isBetween(thirtyDaysAgo, today, "day", "[]") &&
      booking.bookedBy !== "SBFrontDeskFTB"
    );
  });

  const totalBillForLast30Days = filteredLast30DaysBookings.reduce(
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
    data: monthlyBillData,
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
          <div className=''>
            <Formik
              initialValues={{ hotelID: defaultHotelID }} // Only hotelID in initial values
              onSubmit={(values) => {
                console.log("Selected Hotel ID:", values.hotelID); // Log selected value
                handleHotelChange(values.hotelID); // Update filtered bookings based on selected hotel
              }}
            >
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
                          setFieldValue("hotelID", value); // Update Formik state
                          handleHotelChange(value); // Update filtered bookings
                        }}
                      >
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
            className="mb-2 lg:mb-4 text-[#8ABF55] text-center lg:text-left"
          >
            Dashboard Overview
          </Title>

          

          <Row gutter={[16, 24]} className="mb-6">
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card  style={{
    background: 'linear-gradient(45deg, #8A99EB, #9DE1FB, #AFC7F3)',
  }}>
      <Statistic
        title={
          <span className="text-white">
            {"FTB's Booking For Today"}
          </span>
        }
        value={totalBillForToday}
        prefix={<CheckCircleOutlined className="text-white" />}
        valueStyle={{ color: "white" }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={12} md={8} lg={6}>
    <Card  style={{
    background: 'linear-gradient(45deg, #8A99EB, #9DE1FB, #AFC7F3)',
  }}>
      <Statistic
        title={
          <span className="text-white">
            Room Vacancy For Today
          </span>
        }
        value={320}
        prefix={<HomeOutlined className="text-white" />}
        valueStyle={{ color: "white" }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={12} md={8} lg={6}>
    <Card  style={{
    background: 'linear-gradient(45deg, #8A99EB, #9DE1FB, #AFC7F3)',
  }}>
      <Statistic
        title={
          <span className="text-white">
            Last 30 Days Booking Amount FTB
          </span>
        }
        value={totalBillForLast30Days}
        prefix={<CheckCircleOutlined className="text-white" />}
        valueStyle={{ color: "white" }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={12} md={8} lg={6}>
    <Card  style={{
    background: 'linear-gradient(45deg, #8A99EB, #9DE1FB, #AFC7F3)',
  }}>
      <Statistic
        title={
          <span className="text-white">
            Last 30 Days Booking Amount
          </span>
        }
        value={totalBillForLast30Days}
        prefix={<CheckCircleOutlined className="text-white" />}
        valueStyle={{ color: "white" }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={12} md={8} lg={6}>
    <Card  style={{
    background: 'linear-gradient(45deg, #8A99EB, #9DE1FB, #AFC7F3)',
  }}>
      <Statistic
        title={
          <span className="text-white">Total Booking Amount</span>
        }
        value={totalBill}
        prefix={<CheckCircleOutlined className="text-white" />}
        valueStyle={{ color: "white" }}
      />
    </Card>
  </Col>
</Row>


          <div className="">
            {/* Line Chart */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg mt-2">
              <Title
                level={4}
                className="text-[#8ABF55] mb-4 text-center lg:text-left"
              >
                Bookings Over Time
              </Title>
              <Line {...lineChartConfig} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

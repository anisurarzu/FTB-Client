"use client";
import React, { useState, useEffect } from "react";
import {
  Badge,
  Modal,
  Button,
  Descriptions,
  Table,
  Tag,
  Spin,
  Alert,
  Select,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import coreAxios from "@/utils/axiosInstance";

const { Option } = Select;

const CustomCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomInfoModalVisible, setRoomInfoModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);
  const [highlightedDate, setHighlightedDate] = useState(dayjs()); // Default to current date
  const [hotelData, setHotelData] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month")); // Track current month
  const [showFullMonth, setShowFullMonth] = useState(false); // New state for toggling

  useEffect(() => {
    fetchHotelInformation();
  }, []);

  const fetchHotelInformation = async () => {
    try {
      setLoading(true);
      const res = await coreAxios.get(`hotel`);
      if (res?.status === 200) {
        setLoading(false);
        setHotelData(res?.data);
        if (res?.data?.length > 0) {
          setSelectedHotel(res?.data[0].hotelName);
        }
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const getRoomAvailability = (date) => {
    const filteredHotel = hotelData.find(
      (hotel) => hotel.hotelName === selectedHotel
    );

    return filteredHotel
      ? [
          {
            hotelName: filteredHotel.hotelName,
            roomCategories: filteredHotel.roomCategories.map((category) => {
              const availableroomNumbers = category.roomNumbers.filter(
                (room) => !room.bookedDates.includes(date)
              ).length;
              const bookedroomNumbers = category.roomNumbers.filter((room) =>
                room.bookedDates.includes(date)
              ).length;

              return {
                name: category.name,
                availableroomNumbers,
                bookedroomNumbers,
                roomNumbers: category.roomNumbers,
              };
            }),
          },
        ]
      : [];
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    setHighlightedDate(date);
    const availability = getRoomAvailability(formattedDate);
    setSelectedDate(formattedDate);
    setRoomAvailability(availability);
    setIsModalVisible(true);
  };

  const handleRoomClick = (room) => {
    setSelectedRoomInfo(room);
    setRoomInfoModalVisible(true);
  };

  const handleHotelChange = (hotel) => {
    setSelectedHotel(hotel);
    setHighlightedDate(null);
    setRoomAvailability([]);
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  // Toggle between showing from the current date or from the start of the month
  const toggleViewMode = () => {
    setShowFullMonth(!showFullMonth);
  };

  const renderCalendarDays = () => {
    const daysInMonth = currentMonth.daysInMonth();
    const currentDay = dayjs().date(); // Get the current day

    const daysArray = [...Array(daysInMonth).keys()].map((day) =>
      currentMonth.add(day, "day")
    );

    // Determine which days to show based on the toggle state
    const filteredDaysArray = showFullMonth
      ? daysArray
      : currentMonth.isSame(dayjs(), "month")
      ? daysArray.slice(currentDay - 1) // Show from current date in the current month
      : daysArray; // Show all days for previous months

    const rows = [];

    // Break days into chunks of 4
    for (let i = 0; i < filteredDaysArray.length; i += 4) {
      rows.push(filteredDaysArray.slice(i, i + 4));
    }

    return rows.map((week, weekIndex) => (
      <div
        key={weekIndex}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}>
        {week.map((date, index) => {
          const formattedDate = date.format("YYYY-MM-DD");
          const availability = getRoomAvailability(formattedDate);
          const isSelected = highlightedDate
            ? date.isSame(highlightedDate, "day")
            : false;

          return (
            <div
              key={index}
              className="calendar-day"
              style={{
                padding: "5px",
                textAlign: "center",
                border: "1px solid #d9d9d9",
                backgroundColor: isSelected ? "#e6f7ff" : "transparent",
                borderRadius: "4px",
                width: "22%", // 4 dates in a row
              }}
              onClick={() => handleDateSelect(date)}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {date.format("D MMM")}
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {availability.map((hotel, index) => (
                  <li key={index}>
                    <ul>
                      {hotel.roomCategories.map((category, idx) => (
                        <li key={idx}>
                          <span>{category.name}: </span>
                          <Badge
                            count={category.availableroomNumbers}
                            style={{ backgroundColor: "#52c41a" }}
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <>
      <h3 className="text-green-400 font-bold text-center text-2xl ">
        FTB Booking Calendar
      </h3>

      <div className="text-left">
        <Select
          value={selectedHotel}
          onChange={handleHotelChange}
          style={{ width: 300 }}
          placeholder="Select a Hotel">
          {hotelData.map((hotel) => (
            <Option key={hotel.hotelName} value={hotel.hotelName}>
              {hotel.hotelName}
            </Option>
          ))}
        </Select>
      </div>

      <div className="text-center my-4">
      <Button onClick={toggleViewMode} style={{ marginBottom: "10px",marginRight:8 }}>
          {showFullMonth ? "Show Current Date" : "Show Full Month"}
        </Button>
        <Button
          onClick={goToPrevMonth}
          style={{ marginRight: 8, marginBottom: "10px" }}>
          Previous Month
        </Button>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {currentMonth.format("MMMM YYYY")}
        </span>
        <Button onClick={goToNextMonth} style={{ marginLeft: 8 }}>
          Next Month
        </Button>
      </div>

     

      {loading ? (
        <Spin
          className="mt-4"
          tip="Loading, please wait... / লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...">
          <Alert
            message="Processing your request / আপনার অনুরোধ প্রক্রিয়াকরণ করা হচ্ছে"
            description="This may take a moment, thank you for your patience. / এতে কিছু সময় লাগতে পারে, ধন্যবাদ আপনার ধৈর্যের জন্য।"
            type="info"
          />
        </Spin>
      ) : (
        <div>
          {/* Custom Calendar Render */}
          <div className="calendar-grid">{renderCalendarDays()}</div>

          <Modal
            title={`Room Availability for ${selectedDate}`}
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            width={1200}
            footer={[
              <Button key="close" onClick={() => setIsModalVisible(false)}>
                Close
              </Button>,
            ]}>
            <div className="w-full">
              {roomAvailability.map((hotel, hotelIdx) => (
                <div key={hotelIdx} className="mb-8">
                  <div className="text-lg font-bold mb-4">
                    {hotel.hotelName}
                  </div>

                  {/* Use Ant Design Grid System */}
                  <Row gutter={[16, 16]}>
                    {hotel.roomCategories.map((category, idx) => (
                      <Col
                        key={idx}
                        xs={24} // Full width on extra small screens
                        sm={12} // 2 columns on small screens
                        md={8} // 3 columns on medium screens
                        lg={6} // 4 columns on large screens
                      >
                        <div className="bg-white p-4 rounded-md shadow-md">
                          <Tag color="blue">{category.name}</Tag>:{" "}
                          {category.availableroomNumbers} Available /{" "}
                          {category.bookedroomNumbers} Booked
                          <div className="mt-2 space-y-2">
                            {category.roomNumbers.map((room) => (
                              <div key={room.name}>
                                {room.bookedDates.includes(selectedDate) ? (
                                  <Button
                                    type="link"
                                    onClick={() => handleRoomClick(room)}>
                                    <Tag color="yellow">
                                      Room {room.name} is Booked
                                    </Tag>
                                  </Button>
                                ) : (
                                  <Tag color="green">
                                    Room {room.name} is Available
                                  </Tag>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </div>
          </Modal>

          <Modal
            title={`Room Details`}
            visible={roomInfoModalVisible}
            onCancel={() => setRoomInfoModalVisible(false)}
            width="100%"
            footer={[
              <Button
                key="close"
                onClick={() => setRoomInfoModalVisible(false)}>
                Close
              </Button>,
            ]}>
            {selectedRoomInfo && (
              <>
                <Descriptions title={`Room Number: ${selectedRoomInfo.name}`}>
                  <Descriptions.Item label="Booked Dates">
                    {selectedRoomInfo.bookedDates.join(", ") || "Available"}
                  </Descriptions.Item>
                </Descriptions>
                {selectedRoomInfo.bookings.length > 0 ? (
                  <Table
                    dataSource={selectedRoomInfo.bookings}
                    rowKey={(record) => record.guestName}
                    columns={[
                      { title: "Guest Name", dataIndex: "guestName" },
                      {
                        title: "Check In",
                        dataIndex: "checkIn",
                        render: (checkIn) =>
                          dayjs(checkIn).format("D MMM YYYY"),
                      },
                      {
                        title: "Check Out",
                        dataIndex: "checkOut",
                        render: (checkOut) =>
                          dayjs(checkOut).format("D MMM YYYY"),
                      },
                      { title: "Booked By", dataIndex: "bookedBy" },
                      {
                        title: "Total Bill",
                        dataIndex: ["paymentDetails", "totalBill"],
                      },
                      {
                        title: "Advance Payment",
                        dataIndex: ["paymentDetails", "advancePayment"],
                      },
                      {
                        title: "Due Payment",
                        dataIndex: ["paymentDetails", "duePayment"],
                      },
                      {
                        title: "Payment Method",
                        dataIndex: ["paymentDetails", "paymentMethod"],
                      },
                      {
                        title: "Transaction ID",
                        dataIndex: ["paymentDetails", "transactionId"],
                      },
                    ]}
                  />
                ) : (
                  <p>No bookings found for this room.</p>
                )}
              </>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default CustomCalendar;

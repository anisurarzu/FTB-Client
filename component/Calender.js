"use client";
import React, { useState, useEffect } from "react";
import {
  Badge,
  Calendar,
  Modal,
  Button,
  Descriptions,
  Table,
  Tag,
  Spin,
  Alert,
  Select,
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
  const [highlightedDate, setHighlightedDate] = useState(null);
  const [hotelData, setHotelData] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false); // New state for toggling view

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

  const handleDateSelect = (value) => {
    const date = value.format("YYYY-MM-DD");
    setHighlightedDate(value);
    const availability = getRoomAvailability(date);
    setSelectedDate(date);
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

  const toggleDateView = () => {
    setShowAllDates((prev) => !prev); // Toggle between showing all dates or future dates only
  };

  const dateFullCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const today = dayjs().startOf("day"); // Today's date for comparison
    const isPast = value.isBefore(today); // Check if the date is in the past

    // If showAllDates is false, hide past dates by returning an empty div
    if (!showAllDates && isPast) {
      return <div style={{ visibility: "hidden" }} />;
    }

    const availability = getRoomAvailability(date);
    const isSelected = highlightedDate
      ? value.isSame(highlightedDate, "day")
      : false;

    return (
      <div
        style={{
          padding: "5px",
          textAlign: "center",
          border: "1px solid #d9d9d9",
          backgroundColor: isSelected ? "#e6f7ff" : "transparent",
          borderRadius: "4px",
        }}
        onClick={() => handleDateSelect(value)}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            borderBottom: "1px solid #d9d9d9",
          }}>
          {value.format("D MMM YYYY (ddd)")}
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
        <Button onClick={toggleDateView} style={{ marginRight: 8 }}>
          {showAllDates ? "Show Future Dates Only" : "Show All Dates"}
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
          <Calendar
            dateFullCellRender={dateFullCellRender}
            defaultValue={dayjs()} // Start calendar from today's date using dayjs
            onSelect={(date) => {
              const selectedDate = date.format("YYYY-MM-DD");
              if (
                !highlightedDate ||
                !dayjs(selectedDate).isSame(highlightedDate, "day")
              ) {
                handleDateSelect(date);
              }
            }}
          />

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

                  <div className="flex">
                    {hotel.roomCategories.map((category, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-md shadow-md">
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Modal>

          <Modal
            title={`Room Details`}
            visible={roomInfoModalVisible}
            onCancel={() => setRoomInfoModalVisible(false)}
            width={1200}
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

"use client";
import React, { useState, useEffect } from "react";
import {
  Badge,
  Calendar,
  Modal,
  List,
  Button,
  Descriptions,
  Table,
  Tag,
  Spin,
  Alert,
} from "antd";
import moment from "moment";
import coreAxios from "@/utils/axiosInstance";

const CustomCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomInfoModalVisible, setRoomInfoModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);
  const [highlightedDate, setHighlightedDate] = useState(null);
  const [hotelData, setHotelData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const hotelData2 = [
    {
      hotelName: "Samudra Bari",
      roomCategories: [
        {
          name: "3 Bed Flat",
          roomNumbers: [
            {
              name: "A1",
              bookedDates: ["2024-10-05", "2024-10-06"],
              bookings: [
                {
                  guestName: "John Doe",
                  checkIn: "2024-10-05",
                  checkOut: "2024-10-06",
                  bookedBy: "Alice Johnson",
                  paymentDetails: {
                    totalBill: 2000,
                    advancePayment: 1000,
                    duePayment: 1000,
                    paymentMethod: "BKASH",
                    transactionId: "TX123456",
                  },
                },
              ],
            },
            {
              name: "A2",
              bookedDates: [],
              bookings: [],
            },
            {
              name: "A3",
              bookedDates: ["2024-10-05", "2024-10-07"],
              bookings: [
                {
                  guestName: "Alice Smith",
                  checkIn: "2024-10-05",
                  checkOut: "2024-10-07",
                  bookedBy: "Bob Williams",
                  paymentDetails: {
                    totalBill: 4000,
                    advancePayment: 2000,
                    duePayment: 2000,
                    paymentMethod: "NAGAD",
                    transactionId: "TX987654",
                  },
                },
              ],
            },
          ],
        },
        {
          name: "1 Bed Flat",
          roomNumbers: [
            {
              name: "D1",
              bookedDates: ["2024-10-05", "2024-10-06"],
              bookings: [
                {
                  guestName: "Michael Brown",
                  checkIn: "2024-10-05",
                  checkOut: "2024-10-06",
                  bookedBy: "Sarah Lee",
                  paymentDetails: {
                    totalBill: 1500,
                    advancePayment: 750,
                    duePayment: 750,
                    paymentMethod: "BANK",
                    transactionId: "TX456789",
                  },
                },
              ],
            },
            {
              name: "D2",
              bookedDates: [],
              bookings: [],
            },
          ],
        },
        {
          name: "2 Bed Flat",
          roomNumbers: [
            {
              name: "B1",
              bookedDates: ["2024-10-05"],
              bookings: [
                {
                  guestName: "Michael Brown",
                  checkIn: "2024-10-05",
                  checkOut: "2024-10-06",
                  bookedBy: "Sarah Lee",
                  paymentDetails: {
                    totalBill: 1500,
                    advancePayment: 750,
                    duePayment: 750,
                    paymentMethod: "BANK",
                    transactionId: "TX456789",
                  },
                },
              ],
            },
            {
              name: "B2",
              bookedDates: [],
              bookings: [],
            },
          ],
        },
      ],
    },
  ];

  const getRoomAvailability = (date) => {
    return hotelData.map((hotel) => {
      const hotelInfo = {
        hotelName: hotel.hotelName,
        roomCategories: [],
      };

      hotel.roomCategories.forEach((category) => {
        const availableroomNumbers = category.roomNumbers.filter(
          (room) => !room.bookedDates.includes(date)
        ).length;
        const bookedroomNumbers = category.roomNumbers.filter((room) =>
          room.bookedDates.includes(date)
        ).length;

        hotelInfo.roomCategories.push({
          name: category.name,
          availableroomNumbers,
          bookedroomNumbers,
          roomNumbers: category.roomNumbers,
        });
      });

      return hotelInfo;
    });
  };

  // Open the modal only when a date is clicked
  const handleDateSelect = (value) => {
    const date = value.format("YYYY-MM-DD");
    setHighlightedDate(value); // Highlight the selected date
    const availability = getRoomAvailability(date);
    setSelectedDate(date);
    setRoomAvailability(availability);
    setIsModalVisible(true);
  };

  const handleRoomClick = (room) => {
    setSelectedRoomInfo(room);
    setRoomInfoModalVisible(true);
  };

  // Customize the full cell render to highlight selected date and show availability
  const dateFullCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    const availability = getRoomAvailability(date);

    // Highlight the selected date
    const isSelected = highlightedDate
      ? value.isSame(highlightedDate, "day")
      : false;

    return (
      <div
        style={{
          padding: "5px",
          textAlign: "center",
          border: "1px solid #d9d9d9",
          backgroundColor: isSelected ? "#e6f7ff" : "transparent", // Highlight color
          borderRadius: "4px",
        }}
        onClick={() => handleDateSelect(value)} // Only open modal on date click
      >
        {/* Display custom formatted date */}
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            borderBottom: "1px solid #d9d9d9",
          }}>
          {value.format("D MMM YYYY (ddd)")}
        </div>

        {/* Display room availability information */}
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
      <h3 className="text-green-400 font-bold text-left text-2xl ">
        FTB Booking Calendar
      </h3>
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
            onSelect={(date) => {
              // Prevent modal from opening on month/year change
              const selectedDate = date.format("YYYY-MM-DD");
              if (
                !highlightedDate ||
                !moment(selectedDate).isSame(highlightedDate, "day")
              ) {
                handleDateSelect(date);
              }
            }}
          />

          {/* Modals for room availability and room details */}
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
              {/* Iterate over the roomAvailability (hotels) */}
              {roomAvailability.map((hotel, hotelIdx) => (
                <div key={hotelIdx} className="mb-8">
                  {/* Hotel Name */}
                  <div className="text-lg font-bold mb-4">
                    {hotel.hotelName}
                  </div>

                  {/* Room categories grid with 4 equal columns */}
                  <div className="flex">
                    {hotel.roomCategories.map((category, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-md shadow-md">
                        {/* Room Category and availability */}
                        <Tag color="blue">{category.name}</Tag>:{" "}
                        {category.availableroomNumbers} Available /{" "}
                        {category.bookedroomNumbers} Booked
                        <div className="mt-2 space-y-2">
                          {/* Iterate over roomNumbers */}
                          {category.roomNumbers.map((room) => (
                            <div key={room.name}>
                              {/* Check if the room is booked on the selected date */}
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
                      { title: "Check In", dataIndex: "checkIn" },
                      { title: "Check Out", dataIndex: "checkOut" },
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

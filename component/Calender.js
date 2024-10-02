import React, { useState } from "react";
import {
  Badge,
  Calendar,
  Modal,
  List,
  Button,
  Descriptions,
  Table,
  Tag,
} from "antd";
import moment from "moment";

const CustomCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomInfoModalVisible, setRoomInfoModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);
  const [highlightedDate, setHighlightedDate] = useState(null);

  const hotelData = [
    {
      hotelName: "Samudra Bari",
      categories: [
        {
          categoryName: "3 Bed Flat",
          rooms: [
            {
              roomNumber: "A1",
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
              roomNumber: "A2",
              bookedDates: [],
              bookings: [],
            },
            {
              roomNumber: "A3",
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
          categoryName: "1 Bed Flat",
          rooms: [
            {
              roomNumber: "D1",
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
              roomNumber: "D2",
              bookedDates: [],
              bookings: [],
            },
          ],
        },
        {
          categoryName: "2 Bed Flat",
          rooms: [
            {
              roomNumber: "B1",
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
              roomNumber: "B2",
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
        categories: [],
      };

      hotel.categories.forEach((category) => {
        const availableRooms = category.rooms.filter(
          (room) => !room.bookedDates.includes(date)
        ).length;

        hotelInfo.categories.push({
          categoryName: category.categoryName,
          availableRooms,
          rooms: category.rooms,
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
        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
          {value.format("D MMM YYYY (ddd)")}
        </div>

        {/* Display room availability information */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {availability.map((hotel, index) => (
            <li key={index}>
              <ul>
                {hotel.categories.map((category, idx) => (
                  <li key={idx}>
                    <span>{category.categoryName}: </span>
                    <Badge
                      count={category.availableRooms}
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
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}>
        <List
          itemLayout="horizontal"
          dataSource={roomAvailability}
          renderItem={(hotel) => (
            <List.Item>
              <List.Item.Meta
                title={hotel.hotelName}
                description={
                  <ul>
                    {hotel.categories.map((category, idx) => (
                      <li key={idx}>
                        <Tag color="blue">{category.categoryName}</Tag>:{" "}
                        {category.availableRooms} Available /{" "}
                        {category.bookedRooms} Booked
                        {category.rooms.map((room) => (
                          <div key={room.roomNumber}>
                            {/* Corrected logic: Check if the room is booked on the selected date */}
                            {room.bookedDates.includes(selectedDate) ? (
                              <Button
                                type="link"
                                onClick={() => handleRoomClick(room)}>
                                Room {room.roomNumber} is Booked
                              </Button>
                            ) : (
                              <Button
                                className="text-green-500 bg-green-50 rounded-sm"
                                type="link"
                                onClick={() => handleRoomClick(room)}>
                                Room {room.roomNumber} is Available
                              </Button>
                            )}
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={`Room Details`}
        visible={roomInfoModalVisible}
        onCancel={() => setRoomInfoModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setRoomInfoModalVisible(false)}>
            Close
          </Button>,
        ]}>
        {selectedRoomInfo && (
          <>
            <Descriptions title={`Room Number: ${selectedRoomInfo.roomNumber}`}>
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
    </>
  );
};

export default CustomCalendar;

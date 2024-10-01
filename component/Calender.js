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

// Sample booking data for 3 hotels
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
      {
        categoryName: "1 Bed Flat",
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
  // {
  //   hotelName: "City Inn",
  //   categories: [
  //     {
  //       categoryName: "Executive Room",
  //       rooms: [
  //         {
  //           roomNumber: "301",
  //           bookedDates: ["2024-10-05"],
  //           bookings: [
  //             {
  //               guestName: "Emily Davis",
  //               checkIn: "2024-10-05",
  //               checkOut: "2024-10-06",
  //               bookedBy: "David Smith",
  //               paymentDetails: {
  //                 totalBill: 2500,
  //                 advancePayment: 1250,
  //                 duePayment: 1250,
  //                 paymentMethod: "BKASH",
  //                 transactionId: "TX753951",
  //               },
  //             },
  //           ],
  //         },
  //         {
  //           roomNumber: "302",
  //           bookedDates: ["2024-10-07"],
  //           bookings: [
  //             {
  //               guestName: "David Johnson",
  //               checkIn: "2024-10-07",
  //               checkOut: "2024-10-08",
  //               bookedBy: "Linda Adams",
  //               paymentDetails: {
  //                 totalBill: 2200,
  //                 advancePayment: 1100,
  //                 duePayment: 1100,
  //                 paymentMethod: "NAGAD",
  //                 transactionId: "TX159357",
  //               },
  //             },
  //           ],
  //         },
  //         {
  //           roomNumber: "303",
  //           bookedDates: [],
  //           bookings: [],
  //         },
  //       ],
  //     },
  //     {
  //       categoryName: "Economy Room",
  //       rooms: [
  //         {
  //           roomNumber: "401",
  //           bookedDates: [],
  //           bookings: [],
  //         },
  //         {
  //           roomNumber: "402",
  //           bookedDates: [],
  //           bookings: [],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   hotelName: "Seaside Resort",
  //   categories: [
  //     {
  //       categoryName: "Ocean View",
  //       rooms: [
  //         {
  //           roomNumber: "501",
  //           bookedDates: ["2024-10-05", "2024-10-06", "2024-10-07"],
  //           bookings: [
  //             {
  //               guestName: "Sophia Martinez",
  //               checkIn: "2024-10-05",
  //               checkOut: "2024-10-07",
  //               bookedBy: "Tom Harris",
  //               paymentDetails: {
  //                 totalBill: 3000,
  //                 advancePayment: 1500,
  //                 duePayment: 1500,
  //                 paymentMethod: "BANK",
  //                 transactionId: "TX654321",
  //               },
  //             },
  //           ],
  //         },
  //         {
  //           roomNumber: "502",
  //           bookedDates: [],
  //           bookings: [],
  //         },
  //       ],
  //     },
  //     {
  //       categoryName: "Garden View",
  //       rooms: [
  //         {
  //           roomNumber: "601",
  //           bookedDates: ["2024-10-05"],
  //           bookings: [
  //             {
  //               guestName: "James Wilson",
  //               checkIn: "2024-10-05",
  //               checkOut: "2024-10-06",
  //               bookedBy: "Nancy Scott",
  //               paymentDetails: {
  //                 totalBill: 1800,
  //                 advancePayment: 900,
  //                 duePayment: 900,
  //                 paymentMethod: "NAGAD",
  //                 transactionId: "TX951753",
  //               },
  //             },
  //           ],
  //         },
  //         {
  //           roomNumber: "602",
  //           bookedDates: [],
  //           bookings: [],
  //         },
  //       ],
  //     },
  //   ],
  // },
];

// Helper function to calculate available and booked rooms
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

      const bookedRooms = category.rooms.filter((room) =>
        room.bookedDates.includes(date)
      ).length;

      hotelInfo.categories.push({
        categoryName: category.categoryName,
        availableRooms,
        bookedRooms,
        totalRooms: category.rooms.length,
        rooms: category.rooms, // Add rooms to display room numbers
      });
    });

    return hotelInfo;
  });
};

const CustomCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomInfoModalVisible, setRoomInfoModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);

  const handleDateSelect = (value) => {
    const date = value.format("YYYY-MM-DD");
    const availability = getRoomAvailability(date);
    setSelectedDate(date);
    setRoomAvailability(availability);
    setIsModalVisible(true);
  };

  const handleRoomClick = (room) => {
    setSelectedRoomInfo(room);
    setRoomInfoModalVisible(true);
  };

  const dateCellRender = (value) => {
    const date = value.format("YYYY-MM-DD");
    // Format the date to "1 Oct 2024"
    // const formattedDate = value.format("D MMM YYYY");
    const availability = getRoomAvailability(date);

    return (
      <div style={{ padding: "5px" }}>
        <ul>
          {availability.map((hotel, index) => (
            <li key={index}>
              {/* <strong>{hotel.hotelName}</strong> */}
              <ul>
                {hotel.categories.map((category, idx) => (
                  <li key={idx}>
                    <span>{category.categoryName}: </span>
                    <Badge
                      count={category.availableRooms}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                    {/* <Badge
                      count={category.bookedRooms}
                      style={{ backgroundColor: "#F8BD45" }}
                    /> */}

                    {/* <span>
                      Available: {category.availableRooms} / Total:{" "}
                      {category.totalRooms}
                    </span> */}
                    {/* {category.rooms.map((room) => (
                      <div key={room.roomNumber}>
                        {room.bookedDates.length > 0 && (
                          <Button
                            type="link"
                            onClick={() => handleRoomClick(room)}>
                            View Details for Room {room.roomNumber}
                          </Button>
                        )}
                      </div>
                    ))} */}
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
      <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />
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
                            {/* Display booked room details */}
                            {room.bookedDates.length > 0 ? (
                              <Button
                                type="link"
                                onClick={() => handleRoomClick(room)}>
                                View Details for Room {room.roomNumber}
                              </Button>
                            ) : (
                              /* Display available room details */
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
                  {
                    title: "Guest Name",
                    dataIndex: "guestName",
                  },
                  {
                    title: "Check In",
                    dataIndex: "checkIn",
                  },
                  {
                    title: "Check Out",
                    dataIndex: "checkOut",
                  },
                  {
                    title: "Booked By",
                    dataIndex: "bookedBy",
                  },
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

// import React, { useState } from "react";
// import {
//   Badge,
//   Calendar,
//   Modal,
//   List,
//   Button,
//   Descriptions,
//   Table,
//   Tag,
//   Space,
// } from "antd";
// import moment from "moment";

// // Sample booking data for 3 hotels
// const hotelData = [
//   {
//     hotelName: "Hotel Paradise",
//     categories: [
//       {
//         categoryName: "Deluxe Suite",
//         rooms: [
//           {
//             roomNumber: "101",
//             bookedDates: ["2024-10-05", "2024-10-06"],
//             bookings: [
//               {
//                 guestName: "John Doe",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-06",
//                 bookedBy: "Alice Johnson", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 2000,
//                   advancePayment: 1000,
//                   duePayment: 1000,
//                   paymentMethod: "BKASH",
//                   transactionId: "TX123456",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "102",
//             bookedDates: [],
//             bookings: [],
//           },
//           {
//             roomNumber: "103",
//             bookedDates: ["2024-10-05", "2024-10-07"],
//             bookings: [
//               {
//                 guestName: "Alice Smith",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-07",
//                 bookedBy: "Bob Williams", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 4000,
//                   advancePayment: 2000,
//                   duePayment: 2000,
//                   paymentMethod: "NAGAD",
//                   transactionId: "TX987654",
//                 },
//               },
//             ],
//           },
//         ],
//       },
//       {
//         categoryName: "Standard Room",
//         rooms: [
//           {
//             roomNumber: "201",
//             bookedDates: ["2024-10-05"],
//             bookings: [
//               {
//                 guestName: "Michael Brown",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-06",
//                 bookedBy: "Sarah Lee", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 1500,
//                   advancePayment: 750,
//                   duePayment: 750,
//                   paymentMethod: "BANK",
//                   transactionId: "TX456789",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "202",
//             bookedDates: [],
//             bookings: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     hotelName: "City Inn",
//     categories: [
//       {
//         categoryName: "Executive Room",
//         rooms: [
//           {
//             roomNumber: "301",
//             bookedDates: ["2024-10-05"],
//             bookings: [
//               {
//                 guestName: "Emily Davis",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-06",
//                 bookedBy: "David Smith", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 2500,
//                   advancePayment: 1250,
//                   duePayment: 1250,
//                   paymentMethod: "BKASH",
//                   transactionId: "TX753951",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "302",
//             bookedDates: ["2024-10-07"],
//             bookings: [
//               {
//                 guestName: "David Johnson",
//                 checkIn: "2024-10-07",
//                 checkOut: "2024-10-08",
//                 bookedBy: "Linda Adams", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 2200,
//                   advancePayment: 1100,
//                   duePayment: 1100,
//                   paymentMethod: "NAGAD",
//                   transactionId: "TX159357",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "303",
//             bookedDates: [],
//             bookings: [],
//           },
//         ],
//       },
//       {
//         categoryName: "Economy Room",
//         rooms: [
//           {
//             roomNumber: "401",
//             bookedDates: [],
//             bookings: [],
//           },
//           {
//             roomNumber: "402",
//             bookedDates: [],
//             bookings: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     hotelName: "Seaside Resort",
//     categories: [
//       {
//         categoryName: "Ocean View",
//         rooms: [
//           {
//             roomNumber: "501",
//             bookedDates: ["2024-10-05", "2024-10-06", "2024-10-07"],
//             bookings: [
//               {
//                 guestName: "Sophia Martinez",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-07",
//                 bookedBy: "Tom Harris", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 3000,
//                   advancePayment: 1500,
//                   duePayment: 1500,
//                   paymentMethod: "BANK",
//                   transactionId: "TX654321",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "502",
//             bookedDates: [],
//             bookings: [],
//           },
//         ],
//       },
//       {
//         categoryName: "Garden View",
//         rooms: [
//           {
//             roomNumber: "601",
//             bookedDates: ["2024-10-05"],
//             bookings: [
//               {
//                 guestName: "James Wilson",
//                 checkIn: "2024-10-05",
//                 checkOut: "2024-10-06",
//                 bookedBy: "Nancy Scott", // Added bookedBy
//                 paymentDetails: {
//                   totalBill: 1800,
//                   advancePayment: 900,
//                   duePayment: 900,
//                   paymentMethod: "NAGAD",
//                   transactionId: "TX951753",
//                 },
//               },
//             ],
//           },
//           {
//             roomNumber: "602",
//             bookedDates: [],
//             bookings: [],
//           },
//         ],
//       },
//     ],
//   },
// ];

// // Helper function to calculate available and booked rooms
// const getRoomAvailability = (date) => {
//   return hotelData.map((hotel) => {
//     const hotelInfo = {
//       hotelName: hotel.hotelName,
//       categories: [],
//     };

//     hotel.categories.forEach((category) => {
//       const availableRooms = category.rooms.filter(
//         (room) => !room.bookedDates.includes(date)
//       ).length;

//       const bookedRooms = category.rooms.filter((room) =>
//         room.bookedDates.includes(date)
//       ).length;

//       hotelInfo.categories.push({
//         categoryName: category.categoryName,
//         availableRooms,
//         bookedRooms,
//         totalRooms: category.rooms.length,
//         rooms: category.rooms, // Add rooms to display room numbers
//       });
//     });

//     return hotelInfo;
//   });
// };

// const CustomCalendar = () => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [roomInfoModalVisible, setRoomInfoModalVisible] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [roomAvailability, setRoomAvailability] = useState([]);
//   const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);

//   const handleDateSelect = (value) => {
//     const date = value.format("YYYY-MM-DD");
//     const availability = getRoomAvailability(date);
//     setSelectedDate(date);
//     setRoomAvailability(availability);
//     setIsModalVisible(true);
//   };

//   const handleRoomClick = (room) => {
//     setSelectedRoomInfo(room);
//     setRoomInfoModalVisible(true);
//   };

//   const dateCellRender = (value) => {
//     const date = value.format("YYYY-MM-DD");
//     const availability = getRoomAvailability(date);

//     return (
//       <div style={{ padding: "5px" }}>
//         <ul>
//           {availability.map((hotel, index) => (
//             <li key={index}>
//               <strong>{hotel.hotelName}</strong>
//               <ul>
//                 {hotel.categories.map((category, idx) => (
//                   <li key={idx}>
//                     {category.categoryName}:
//                     <span style={{ color: "green" }}>
//                       {" "}
//                       Available: {category.availableRooms}{" "}
//                     </span>
//                     |
//                     <span style={{ color: "red" }}>
//                       {" "}
//                       Booked: {category.bookedRooms}{" "}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   // Define columns for the unified table
//   const columns = [
//     {
//       title: "Detail",
//       dataIndex: "detail",
//       key: "detail",
//     },
//     {
//       title: "Information",
//       dataIndex: "info",
//       key: "info",
//     },
//     {
//       title: "Guest Name",
//       dataIndex: "guestName",
//       key: "guestName",
//       render: (text) => <a>{text}</a>,
//     },
//     {
//       title: "Check In",
//       dataIndex: "checkIn",
//       key: "checkIn",
//     },
//     {
//       title: "Check Out",
//       dataIndex: "checkOut",
//       key: "checkOut",
//     },
//     {
//       title: "Total Bill",
//       dataIndex: "totalBill",
//       key: "totalBill",
//     },
//     {
//       title: "Advance Payment",
//       dataIndex: "advancePayment",
//       key: "advancePayment",
//     },
//     {
//       title: "Due Payment",
//       dataIndex: "duePayment",
//       key: "duePayment",
//     },
//     {
//       title: "Payment Method",
//       dataIndex: "paymentMethod",
//       key: "paymentMethod",
//     },
//     {
//       title: "Transaction ID",
//       dataIndex: "transactionId",
//       key: "transactionId",
//     },
//     {
//       title: "Booked By",
//       dataIndex: "bookedBy",
//       key: "bookedBy",
//     },

//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Space size="middle">
//           <a>Invite {record.guestName}</a>
//           <a>Delete</a>
//         </Space>
//       ),
//     },
//   ];

//   // Prepare data for the table
//   const dataSource = [];

//   // Add room information to the data source
//   if (selectedRoomInfo) {
//     dataSource.push(
//       {
//         key: "roomInfo",
//         detail: "Room Number",
//         info: selectedRoomInfo.roomNumber,
//       },
//       {
//         key: "bookingStatus",
//         detail: "Booking Status",
//         info: selectedRoomInfo.bookedDates.length > 0 ? "Booked" : "Available",
//       }
//     );

//     // Add bookings to the data source
//     selectedRoomInfo.bookings.forEach((booking, index) => {
//       dataSource.push({
//         key: `booking_${index}`,
//         guestName: booking.guestName,
//         checkIn: booking.checkIn,
//         checkOut: booking.checkOut,
//         totalBill: booking.paymentDetails.totalBill,
//         advancePayment: booking.paymentDetails.advancePayment,
//         duePayment: booking.paymentDetails.duePayment,
//         paymentMethod: booking.paymentDetails.paymentMethod,
//         transactionId: booking.paymentDetails.transactionId,
//         bookedBy: booking.bookedBy,
//          // Adjust if there's a tags field in your booking data
//       });
//     });
//   }

//   return (
//     <>
//       <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />

//       {/* Modal to show detailed room availability for selected date */}
//       <Modal
//         title={`Room Availability on ${selectedDate}`}
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}>
//         <List
//           itemLayout="vertical"
//           dataSource={roomAvailability}
//           renderItem={(hotel) => (
//             <List.Item>
//               <h3>{hotel.hotelName}</h3>
//               <ul>
//                 {hotel.categories.map((category, idx) => (
//                   <li key={idx}>
//                     {category.categoryName}: Available:{" "}
//                     <span style={{ color: "green" }}>
//                       {category.availableRooms}
//                     </span>
//                     , Booked:{" "}
//                     <span style={{ color: "red" }}>{category.bookedRooms}</span>
//                     , Total: {category.totalRooms}
//                     <ul>
//                       {category.rooms.map((room, i) => (
//                         <li key={i}>
//                           <Badge
//                             color={
//                               room.bookedDates.length > 0 ? "yellow" : "green"
//                             }
//                             text={`Room ${room.roomNumber} (${
//                               room.bookedDates.length > 0
//                                 ? "Booked"
//                                 : "Available"
//                             })`}
//                           />
//                           <Button
//                             type="link"
//                             onClick={() => handleRoomClick(room)}>
//                             View Details
//                           </Button>
//                         </li>
//                       ))}
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             </List.Item>
//           )}
//         />
//       </Modal>

//       {/* Modal for detailed room info */}
//       {/* Modal for detailed room info */}
//       {/* Modal for detailed room info */}
//      <Modal
//       title={`Room Details for Room ${selectedRoomInfo?.roomNumber}`}
//       visible={roomInfoModalVisible}
//       onCancel={() => setRoomInfoModalVisible(false)}
//       footer={null}
//       width="100%" // Set modal width to 100%
//       style={{ maxWidth: '1200px' }} // Max width for larger screens
//       bodyStyle={{ overflow: 'auto' }} // Make sure body is scrollable if needed
//       className="responsive-modal" // Optional: Add a class for further styling
//     >
//       <Table
//         columns={columns}
//         dataSource={dataSource}
//         pagination={false}
//         bordered
//         scroll={{ x: 'max-content' }} // Allow horizontal scrolling if necessary
//       />
//     </Modal>
//     </>
//   );
// };

// export default CustomCalendar;

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
  Space,
} from "antd";
import moment from "moment";

// Sample booking data for 3 hotels
const hotelData = [
  {
    hotelName: "Hotel Paradise",
    categories: [
      {
        categoryName: "Deluxe Suite",
        rooms: [
          {
            roomNumber: "101",
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
            roomNumber: "102",
            bookedDates: [],
            bookings: [],
          },
          {
            roomNumber: "103",
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
        categoryName: "Standard Room",
        rooms: [
          {
            roomNumber: "201",
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
            roomNumber: "202",
            bookedDates: [],
            bookings: [],
          },
        ],
      },
    ],
  },
  {
    hotelName: "City Inn",
    categories: [
      {
        categoryName: "Executive Room",
        rooms: [
          {
            roomNumber: "301",
            bookedDates: ["2024-10-05"],
            bookings: [
              {
                guestName: "Emily Davis",
                checkIn: "2024-10-05",
                checkOut: "2024-10-06",
                bookedBy: "David Smith",
                paymentDetails: {
                  totalBill: 2500,
                  advancePayment: 1250,
                  duePayment: 1250,
                  paymentMethod: "BKASH",
                  transactionId: "TX753951",
                },
              },
            ],
          },
          {
            roomNumber: "302",
            bookedDates: ["2024-10-07"],
            bookings: [
              {
                guestName: "David Johnson",
                checkIn: "2024-10-07",
                checkOut: "2024-10-08",
                bookedBy: "Linda Adams",
                paymentDetails: {
                  totalBill: 2200,
                  advancePayment: 1100,
                  duePayment: 1100,
                  paymentMethod: "NAGAD",
                  transactionId: "TX159357",
                },
              },
            ],
          },
          {
            roomNumber: "303",
            bookedDates: [],
            bookings: [],
          },
        ],
      },
      {
        categoryName: "Economy Room",
        rooms: [
          {
            roomNumber: "401",
            bookedDates: [],
            bookings: [],
          },
          {
            roomNumber: "402",
            bookedDates: [],
            bookings: [],
          },
        ],
      },
    ],
  },
  {
    hotelName: "Seaside Resort",
    categories: [
      {
        categoryName: "Ocean View",
        rooms: [
          {
            roomNumber: "501",
            bookedDates: ["2024-10-05", "2024-10-06", "2024-10-07"],
            bookings: [
              {
                guestName: "Sophia Martinez",
                checkIn: "2024-10-05",
                checkOut: "2024-10-07",
                bookedBy: "Tom Harris",
                paymentDetails: {
                  totalBill: 3000,
                  advancePayment: 1500,
                  duePayment: 1500,
                  paymentMethod: "BANK",
                  transactionId: "TX654321",
                },
              },
            ],
          },
          {
            roomNumber: "502",
            bookedDates: [],
            bookings: [],
          },
        ],
      },
      {
        categoryName: "Garden View",
        rooms: [
          {
            roomNumber: "601",
            bookedDates: ["2024-10-05"],
            bookings: [
              {
                guestName: "James Wilson",
                checkIn: "2024-10-05",
                checkOut: "2024-10-06",
                bookedBy: "Nancy Scott",
                paymentDetails: {
                  totalBill: 1800,
                  advancePayment: 900,
                  duePayment: 900,
                  paymentMethod: "NAGAD",
                  transactionId: "TX951753",
                },
              },
            ],
          },
          {
            roomNumber: "602",
            bookedDates: [],
            bookings: [],
          },
        ],
      },
    ],
  },
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
    const availability = getRoomAvailability(date);

    return (
      <div style={{ padding: "5px" }}>
        <ul>
          {availability.map((hotel, index) => (
            <li key={index}>
              <strong>{hotel.hotelName}</strong>
              <ul>
                {hotel.categories.map((category, idx) => (
                  <li key={idx}>
                    {category.categoryName}:
                    <span style={{ color: "green" }}>
                      {" "}
                      Available: {category.availableRooms}{" "}
                    </span>
                    |
                    <span style={{ color: "red" }}>
                      {" "}
                      Booked: {category.bookedRooms}{" "}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Define columns for the unified table
  const columns = [
    {
      title: "Detail",
      dataIndex: "detail",
      key: "detail",
    },
    {
      title: "Information",
      dataIndex: "info",
      key: "info",
    },
    {
      title: "Guest Name",
      dataIndex: "guestName",
      key: "guestName",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
    },
    {
      title: "Total Bill",
      dataIndex: "totalBill",
      key: "totalBill",
    },
    {
      title: "Advance Payment",
      dataIndex: "advancePayment",
      key: "advancePayment",
    },
    {
      title: "Due Payment",
      dataIndex: "duePayment",
      key: "duePayment",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
    },
  ];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRoomInfo(null);
  };

  return (
    <div>
      <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />

      <Modal
        title={`Room Availability on ${selectedDate}`}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}>
        <List
          itemLayout="vertical"
          dataSource={roomAvailability}
          renderItem={(hotel) => (
            <List.Item key={hotel.hotelName}>
              <List.Item.Meta
                title={hotel.hotelName}
                description={hotel.categories.map((category) => (
                  <div key={category.categoryName}>
                    <h4>{category.categoryName}</h4>
                    <div>
                      <strong>Available Rooms: </strong>
                      {category.availableRooms} |{" "}
                      <strong>Booked Rooms: </strong>
                      {category.bookedRooms}
                    </div>
                    <Button
                      type="link"
                      onClick={() => {
                        handleRoomClick(category.rooms[0]); // Show first room details for demo
                      }}>
                      View Rooms
                    </Button>
                  </div>
                ))}
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={`Room Details`}
        visible={roomInfoModalVisible}
        onCancel={() => setRoomInfoModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRoomInfoModalVisible(false)}>
            Close
          </Button>,
        ]}>
        {selectedRoomInfo && (
          <Descriptions bordered>
            <Descriptions.Item label="Room Number">
              {selectedRoomInfo.roomNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Total Rooms">
              {selectedRoomInfo.bookedDates.length > 0 ? (
                <Badge
                  count={selectedRoomInfo.bookedDates.length}
                  style={{ backgroundColor: "#52c41a" }}
                />
              ) : (
                <Badge count={0} style={{ backgroundColor: "#f5222d" }} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Bookings">
              {selectedRoomInfo.bookings.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={selectedRoomInfo.bookings.map((booking) => ({
                    detail: `Booking for ${booking.guestName}`,
                    info: `${booking.checkIn} - ${booking.checkOut}`,
                    guestName: booking.guestName,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    totalBill: booking.paymentDetails.totalBill,
                    advancePayment: booking.paymentDetails.advancePayment,
                    duePayment: booking.paymentDetails.duePayment,
                    paymentMethod: booking.paymentDetails.paymentMethod,
                    transactionId: booking.paymentDetails.transactionId,
                  }))}
                  pagination={false}
                />
              ) : (
                <Tag color="green">No bookings available</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomCalendar;

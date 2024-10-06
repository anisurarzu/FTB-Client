"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  message,
  Popconfirm,
  Spin,
  Form,
  Input,
  DatePicker,
  Tooltip,
  Select,
  Row,
  Col,
  Pagination,
  Alert,
} from "antd";
import { useFormik } from "formik";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from "uuid";
import coreAxios from "@/utils/axiosInstance";
import { CopyOutlined } from "@ant-design/icons";
import Link from "next/link"; // For routing

const BookingInfo = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [guestInfo, setGuestInfo] = useState(null);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

  const fetchRoomCategories = async () => {
    try {
      const response = await coreAxios.get("hotelCategory");
      if (Array.isArray(response.data)) {
        setRoomCategories(response.data);
      } else {
        setRoomCategories([]); // or handle appropriately
      }
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };

  const fetchHotelInfo = async () => {
    try {
      const response = await coreAxios.get("hotel");
      if (Array.isArray(response.data)) {
        setHotelInfo(response.data);
      } else {
        setHotelInfo([]); // or handle appropriately
      }
    } catch (error) {
      message.error("Failed to fetch hotel information.");
    }
  };

  const fetchHotelCategories = async (value) => {
    // Filter the hotel data by hotelID
    const hotel = hotelInfo.find((hotel) => hotel.hotelID === value);

    // console.log("---------", hotel);
    // Check if hotel is found and has roomCategories
    if (hotel && hotel.roomCategories) {
      // Set the roomCategories to the state
      setRoomCategories(hotel.roomCategories);
    } else {
      // Handle the case where the hotel is not found or no roomCategories exist
      // console.log("Hotel not found or no room categories available.");
      setRoomCategories([]);
    }
  };

  // Function to check if two date ranges overlap
  // Function to check if two date ranges overlap
  const areDatesOverlapping = (checkInDate, checkOutDate, bookedDates) => {
    return bookedDates.some((bookedDate) => {
      const booked = dayjs(bookedDate);
      const checkIn = dayjs(checkInDate);
      const checkOut = dayjs(checkOutDate);

      // Check if the booked date is within the range [checkInDate, checkOutDate]
      return (
        (booked.isAfter(checkIn, "day") && booked.isBefore(checkOut, "day")) ||
        booked.isSame(checkIn, "day") ||
        booked.isSame(checkOut, "day")
      );
    });
  };

  const fetchRoomNumbers = async (value) => {
    const room = roomCategories.find((room) => room._id === value);

    if (room && room.roomNumbers) {
      const availableRooms = room.roomNumbers.filter((roomNumber) => {
        // Check if the room has any bookedDates
        if (roomNumber.bookedDates.length > 0) {
          // If bookedDates exist, check for overlapping dates
          const isOverlapping = areDatesOverlapping(
            formik.values.checkInDate,
            formik.values.checkOutDate,
            roomNumber.bookedDates
          );

          // If there's an overlap, exclude the room from available rooms
          return !isOverlapping;
        }

        // If no bookedDates exist, the room is available
        return true;
      });

      // Set the filtered available rooms to state
      setRoomNumbers(availableRooms);
    } else {
      // Handle the case where the room or room numbers are not available
      setRoomNumbers([]);
    }
  };

  const fetchGuestInfo = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/guest?name=${name}`);
      if (response.data) {
        setGuestInfo(response.data);
        formik.setValues({
          fullName: response.data.fullName,
          nidPassport: response.data.nidPassport,
          address: response.data.address,
          phone: response.data.phone,
          email: response.data.email,
        });
      } else {
        setGuestInfo(null);
      }
    } catch (error) {
      message.error("Failed to fetch guest information.");
    } finally {
      setLoading(false);
    }
  };

  // Retrieve the userInfo from localStorage
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const updateRoomBookingStatus = async (values) => {
    setLoading(true);
    // Prepare the dynamic booking update payload based on form data
    const bookingUpdatePayload = {
      hotelID: values?.hotelID, // Now included in the body
      categoryName: values?.roomCategoryName, // Use roomCategoryName to match your structure
      roomName: values?.roomNumberName, // Now included in the body
      booking: {
        name: values.roomNumberName,
        bookedDates: [
          dayjs(values.checkInDate).format("YYYY-MM-DD"),
          dayjs(values.checkOutDate).format("YYYY-MM-DD"),
        ],
        bookings: [
          {
            guestName: values.fullName,
            checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
            checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
            bookedBy: values.bookedBy,
            adults: values?.adults,
            children: values?.children,
            paymentDetails: {
              totalBill: values.totalBill,
              advancePayment: values.advancePayment,
              duePayment: values.duePayment,
              paymentMethod: values.paymentMethod,
              transactionId: values.transactionId,
            },
          },
        ],
      },
    };

    // Make the API call to update the room booking

    const updateBookingResponse = await coreAxios.put(
      `/hotel/room/updateBooking`, // Same route as before
      bookingUpdatePayload // Send full payload in request body
    );
    if (updateBookingResponse.status === 200) {
      const newBooking = {
        ...values,
        checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
        checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
        key: uuidv4(), // Generate a unique key for this booking
        bookingID: updateBookingResponse?.data?.hotel?._id, // Correctly extracting the bookingId from response
      };

      // First, create or update the booking in the booking collection
      let response;
      if (isEditing) {
        response = await coreAxios.put(`booking/${editingKey}`, newBooking);
        if (response.status === 200) {
          setLoading(false);
          message.success("Booking created/updated successfully!");
        } else {
          setLoading(false);
          message.error("Failed to create/update booking.");
        }
      } else {
        response = await coreAxios.post("booking", newBooking);
        if (response.status === 200) {
          setLoading(false);
          message.success("Booking created/updated successfully!");
        } else {
          setLoading(false);
          message.error("Failed to create/update booking.");
        }
      }

      setVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      message.success("Room booking status updated successfully!");
      fetchBookings(); // Fetch updated bookings after successful update
    } else {
      message.error("Failed to update room booking status.");
    }
  };

  const formik = useFormik({
    initialValues: {
      fullName: "",
      nidPassport: "",
      address: "",
      phone: "",
      email: "",
      hotelID: 0,
      hotelName: "",
      roomCategoryID: 0,
      roomCategoryName: "",
      roomNumberID: 0,
      roomNumberName: "",
      roomPrice: 0,
      checkInDate: dayjs(), // Set default to current date
      checkOutDate: dayjs().add(1, "day"), // One day after the current date
      nights: 0,
      totalBill: 0,
      advancePayment: 0,
      duePayment: 0,
      paymentMethod: "",
      transactionId: "",
      note: "",
      bookedBy: userInfo ? userInfo?.username : "",
      bookedByID: userInfo ? userInfo?.loginID : "",
      reference: "",
      adults: 0,
      children: 0,
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        await updateRoomBookingStatus(values);
        resetForm();
      } catch (error) {
        message.error("Failed to add/update booking.");
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("bookings");
      if (response.status === 200) {
        setBookings(response?.data);
        setFilteredBookings(response?.data);
      }
    } catch (error) {
      message.error("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };
  const fetchBookingsReportByBookingNo = async (bookingNo) => {
    setLoading(true);
    try {
      const response = await coreAxios.get(`bookings/bookingNo/${"FTB-01"}`);
      if (response.status === 200) {
        setReportData(response?.data);
      }
    } catch (error) {
      message.error("Failed to fetch bookings report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelInfo();
    fetchBookings();
    fetchRoomCategories();
  }, []);

  const handleHotelInfo = (value) => {
    console.log("hotel_value", value);
    // Find the selected hotel based on the value
    const selectedHotel = hotelInfo.find((hotel) => hotel.hotelID === value);

    // Update formik values
    formik.setFieldValue("roomCategoryID", 0); // Reset room category
    formik.setFieldValue("roomCategoryName", ""); // Reset room category name
    formik.setFieldValue("roomNumberID", ""); // Reset room number
    formik.setFieldValue("roomNumberName", ""); // Reset room number name
    formik.setFieldValue("hotelID", value); // Set the selected hotel ID
    formik.setFieldValue(
      "hotelName",
      selectedHotel ? selectedHotel.hotelName : ""
    ); // Set the selected hotel name
    fetchHotelCategories(value); // Fetch room categories for the selected hotel
  };

  const handleRoomCategoryChange = (value) => {
    console.log("cat_value", value);
    // Find the selected category based on the value
    const selectedCategory = roomCategories.find(
      (category) => category._id === value
    );

    // Update formik values
    formik.setFieldValue("roomNumberID", 0); // Reset room number
    formik.setFieldValue("roomNumberName", ""); // Reset room number name
    formik.setFieldValue("roomCategoryID", value); // Set the selected category ID
    formik.setFieldValue(
      "roomCategoryName",
      selectedCategory ? selectedCategory.name : ""
    ); // Set the selected category name
    fetchRoomNumbers(value); // Fetch room numbers for the selected category
  };

  const handleEdit = (record) => {
    console.log("editeddata", record);
    setEditingKey(record?._id);
    // formik.setValues(record);

    const checkInDate = dayjs(record.checkInDate);
    const checkOutDate = dayjs(record.checkOutDate);
    if (record) {
      formik.setValues({
        ...formik.values,
        fullName: record.fullName,
        nidPassport: record.nidPassport,
        address: record.address,
        phone: record.phone,
        email: record.email,
        hotelName: record.hotelName,
        roomCategoryName: record.roomCategoryName,
        roomNumberID: record.roomNumberID,
        roomNumberName: record?.roomNumberName,
        roomPrice: record.roomPrice,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: record.adults,
        children: record.children,
        nights: record.nights,
        totalBill: record.totalBill,
        advancePayment: record.advancePayment,
        duePayment: record.duePayment,
        paymentMethod: record.paymentMethod,
        transactionId: record.transactionId,
        note: record.note,
      });
    }
    setVisible(true);
    setIsEditing(true);
  };

  const handleDelete = async (value) => {
    console.log("value", value);
    setLoading(true);
    try {
      // Now, proceed to delete the booking using the delete API
      const deleteResponse = await coreAxios.delete("/api/bookings/delete", {
        data: {
          hotelID: value?.hotelID,
          categoryName: value?.roomCategoryName,
          roomName: value?.roomNumberName,
          bookingID: value?.bookingID,
        },
      });

      if (deleteResponse.status === 200) {
        // message.success("Booking deleted successfully!");
        handleDelete2(value?._id);
        // fetchBookings(); // Refresh the bookings list after deletion
      }
    } catch (error) {
      message.error("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete2 = async (key) => {
    setLoading(true);
    try {
      const res = await coreAxios.delete(`booking/${key}`);
      if (res.status === 200) {
        message.success("Booking deleted successfully!");
        fetchBookings();
      }
    } catch (error) {
      message.error("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    // Update the price or nights based on the changed input
    formik.setFieldValue(name, value);

    // Calculate totalBill based on roomPrice and nights
    const roomPrice = name === "roomPrice" ? value : formik.values.roomPrice;
    const nights = name === "nights" ? value : formik.values.nights;
    const totalBill = roomPrice * nights;

    // Calculate the due payment based on the advancePayment and totalBill
    const advancePayment = formik.values.advancePayment || 0;
    const duePayment = totalBill - advancePayment;

    // Update totalBill and duePayment fields in formik
    formik.setFieldValue("totalBill", totalBill);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0);
  };

  const handleNightsChange = (e) => {
    const nights = parseInt(e.target.value) || 0; // Get the new value for nights
    formik.setFieldValue("nights", nights);

    const roomPrice = formik.values.roomPrice || 0;
    const totalBill = roomPrice * nights;

    // Get the current advance payment
    let advancePayment = parseFloat(formik.values.advancePayment) || 0;

    // Adjust advance payment if it exceeds totalBill
    if (advancePayment > totalBill) {
      advancePayment = totalBill;
    }

    // Calculate the due payment
    const duePayment = totalBill - advancePayment;

    // Update totalBill, advancePayment, and duePayment in formik
    formik.setFieldValue("totalBill", totalBill);
    formik.setFieldValue("advancePayment", advancePayment);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0);
  };

  // Function to handle advance payment and calculate due payment
  const handleAdvancePaymentChange = (e) => {
    const advancePayment = e.target.value;
    const totalBill = formik.values.totalBill;

    // Calculate due payment
    const duePayment = totalBill - advancePayment;

    // Set the field values in formik
    formik.setFieldValue("advancePayment", advancePayment);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0); // Ensure due payment is non-negative
  };
  // Handle pagination
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle global search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filteredData = bookings.filter(
      (r) =>
        r.fullName.toLowerCase().includes(value) ||
        r.roomCategoryName.toLowerCase().includes(value) ||
        r.roomNumberName.toLowerCase().includes(value)
    );
    setFilteredBookings(filteredData);
    setPagination({ ...pagination, current: 1 }); // Reset to page 1 after filtering
  };

  // Paginate the filtered data
  const paginatedBookings = filteredBookings.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const fetchBookingDetails = async (bookingNo) => {
    try {
      const response = await coreAxios.get(`/bookings/bookingNo/${bookingNo}`);
      return response.data;
    } catch (error) {
      message.error(
        "Failed to fetch booking details. Please check the booking number."
      );
      return null;
    }
  };

  const handleBlur = async (e) => {
    const { value } = e.target;
    if (value) {
      const bookings = await fetchBookingDetails(value);
      const bookingDetails = bookings[0];

      const checkInDate = dayjs(bookingDetails.checkInDate);
      const checkOutDate = dayjs(bookingDetails.checkOutDate);
      if (bookingDetails) {
        formik.setValues({
          ...formik.values,
          fullName: bookingDetails.fullName,
          nidPassport: bookingDetails.nidPassport,
          address: bookingDetails.address,
          phone: bookingDetails.phone,
          email: bookingDetails.email,
          // hotelName: bookingDetails.hotelName,
          // roomCategoryName: bookingDetails.roomCategoryID,
          // roomNumberID: bookingDetails.roomNumberID,
          // roomPrice: bookingDetails.roomPrice,
          // checkInDate: checkInDate,
          // checkOutDate: checkOutDate,
          // adults: bookingDetails.adults,
          // children: bookingDetails.children,
          // nights: bookingDetails.nights,
          // totalBill: bookingDetails.totalBill,
          // advancePayment: bookingDetails.advancePayment,
          // duePayment: bookingDetails.duePayment,
          // paymentMethod: bookingDetails.paymentMethod,
          // transactionId: bookingDetails.transactionId,
          // note: bookingDetails.note,
        });
        message.success("Booking details loaded successfully!");
      }
    }
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
        <div className="">
          <div className="flex justify-between">
            <Button
              type="primary"
              onClick={() => {
                formik.resetForm();
                setVisible(true);
                setIsEditing(false);
              }}
              className="mb-4 bg-[#8ABF55] hover:bg-[#7DA54E] text-white">
              Add New Booking
            </Button>
            {/* Global Search Input */}
            <Input
              placeholder="Search bookings..."
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300, marginBottom: 20 }}
            />
          </div>

          <div className="relative overflow-x-auto shadow-md">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              {/* Table Header */}
              <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="border border-tableBorder text-center p-2">
                    Booking No.
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Booked By
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Guest Name
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Hotel
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Flat Type
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Flat No/Unit
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Check In
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Check Out
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Nights
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Total
                  </th>
                  <th className="border border-tableBorder text-center p-2">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredBookings?.map((booking) => (
                  <tr
                    key={booking.bookingNo}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* Booking No with Link and Copy Feature */}
                    <td className="border border-tableBorder text-center p-2">
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <Link href={`/dashboard/${booking.bookingNo}`} passHref>
                          <p
                            style={{
                              color: "#1890ff",
                              cursor: "pointer",
                              marginRight: 8,
                            }}>
                            {booking.bookingNo}
                          </p>
                        </Link>
                        <Tooltip title="Click to copy">
                          <CopyToClipboard
                            text={booking.bookingNo}
                            onCopy={() => message.success("Copied!")}>
                            <CopyOutlined
                              style={{ cursor: "pointer", color: "#1890ff" }}
                            />
                          </CopyToClipboard>
                        </Tooltip>
                      </span>
                    </td>

                    {/* Booked By */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.bookedBy}
                    </td>

                    {/* Guest Name */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.fullName}
                    </td>
                    {/* Hotel Name */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.hotelName}
                    </td>

                    {/* Flat Type */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.roomCategoryName}
                    </td>

                    {/* Flat No/Unit */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.roomNumberName}
                    </td>

                    {/* Check In */}
                    <td className="border border-tableBorder text-center p-2">
                      {moment(booking.checkInDate).format("D MMM YYYY")}
                    </td>

                    {/* Check Out */}
                    <td className="border border-tableBorder text-center p-2">
                      {moment(booking.checkOutDate).format("D MMM YYYY")}
                    </td>

                    {/* Nights */}
                    <td className="border border-tableBorder text-center p-2">
                      {booking.nights}
                    </td>

                    {/* Total Bill */}
                    <td className="border border-tableBorder text-center p-2 font-bold text-green-900">
                      {booking.totalBill}
                    </td>

                    {/* Actions */}
                    <td className="border border-tableBorder text-center p-2">
                      <div className="flex">
                        {" "}
                        <Button onClick={() => handleEdit(booking)}>
                          Edit
                        </Button>
                        <Popconfirm
                          title="Are you sure to delete this booking?"
                          onConfirm={() => handleDelete(booking)}>
                          <Button type="link" danger>
                            Delete
                          </Button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination (commented out) */}

            <div className="flex justify-center p-2">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={filteredBookings?.length}
                onChange={(page) =>
                  setPagination({ ...pagination, current: page })
                }
                className="mt-4"
              />
            </div>
          </div>

          <Modal
            title={isEditing ? "Edit Booking" : "Create Booking"}
            open={visible}
            onCancel={() => setVisible(false)}
            footer={null}
            width={800}>
            <Form onFinish={formik.handleSubmit} layout="vertical">
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Prev Booking No." className="mb-2">
                    <Input
                      name="reference"
                      value={formik.values.reference}
                      onChange={formik.handleChange}
                      onBlur={handleBlur} // Call API when the user leaves the input
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Full Name" className="mb-2">
                    <Input
                      name="fullName"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="NID/Passport" className="mb-2">
                    <Input
                      name="nidPassport"
                      value={formik.values.nidPassport}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Address" className="mb-2">
                    <Input
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Phone Number" className="mb-2">
                    <Input
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="E-mail" className="mb-2">
                    <Input
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      required={false}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Check In Date" className="mb-2">
                    <DatePicker
                      name="checkInDate"
                      value={formik.values.checkInDate}
                      required={true}
                      onChange={(date) =>
                        formik.setFieldValue("checkInDate", date)
                      }
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Check Out Date" className="mb-2">
                    <DatePicker
                      name="checkOutDate"
                      required={true}
                      value={formik.values.checkOutDate}
                      onChange={(date) =>
                        formik.setFieldValue("checkOutDate", date)
                      }
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Hotel Name" className="mb-2">
                    <Select
                      name="hotelName"
                      value={formik.values.hotelName}
                      onChange={handleHotelInfo}>
                      {hotelInfo.map((hotel) => (
                        <Select.Option
                          key={hotel.hotelID}
                          value={hotel.hotelID}>
                          {hotel.hotelName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Room Categories" className="mb-2">
                    <Select
                      name="roomCategoryID"
                      value={formik.values.roomCategoryName}
                      onChange={handleRoomCategoryChange}>
                      {roomCategories.map((category) => (
                        <Select.Option key={category._id} value={category._id}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Room Number" className="mb-2">
                    <Select
                      name="roomNumberID"
                      value={formik.values.roomNumberID}
                      onChange={(value) => {
                        const selectedRoom = roomNumbers.find(
                          (room) => room._id === value
                        );
                        formik.setFieldValue("roomNumberID", value);
                        formik.setFieldValue(
                          "roomNumberName",
                          selectedRoom ? selectedRoom.name : ""
                        );
                      }}>
                      {roomNumbers.map((room) => (
                        <Select.Option key={room._id} value={room._id}>
                          {room.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Room Price" className="mb-2">
                    <Input
                      name="roomPrice"
                      value={formik.values.roomPrice}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Number of Adults" className="mb-2">
                    <Input
                      name="adults"
                      value={formik.values.adults}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Numbers of Children" className="mb-2">
                    <Input
                      name="children"
                      value={formik.values.children}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Number of Nights" className="mb-2">
                    <Input
                      name="nights"
                      required={true}
                      value={formik.values.nights}
                      onChange={(e) => {
                        formik.handleChange(e);
                        // handleNightsChange(e);
                      }}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Total Bill" className="mb-2">
                    <Input
                      name="totalBill"
                      value={formik.values.totalBill}
                      onChange={formik.handleChange}
                      required={true}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Advance Payment" className="mb-2">
                    <Input
                      name="advancePayment"
                      required={true}
                      value={formik.values.advancePayment}
                      onChange={handleAdvancePaymentChange}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Due Payment" className="mb-2">
                    <Input
                      name="duePayment"
                      value={formik.values.duePayment}
                      readOnly
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Payment Method" className="mb-2">
                    <Select
                      required={true}
                      name="paymentMethod"
                      value={formik.values.paymentMethod}
                      onChange={(value) =>
                        formik.setFieldValue("paymentMethod", value)
                      }>
                      <Select.Option value="BKASH">BKASH</Select.Option>
                      <Select.Option value="NAGAD">NAGAD</Select.Option>
                      <Select.Option value="BANK">BANK</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Transaction ID" className="mb-2">
                    <Input
                      required={true}
                      name="transactionId"
                      value={formik.values.transactionId}
                      onChange={formik.handleChange}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Note" className="mb-2">
                    <Input
                      name="note"
                      value={formik.values.note}
                      onChange={formik.handleChange}
                    />
                  </Form.Item>
                </div>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-[#8ABF55] hover:bg-[#7DA54E]">
                {isEditing ? "Update Booking" : "Create Booking"}
              </Button>
            </Form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default BookingInfo;

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
  Pagination,
  Alert,
  Switch,
  Skeleton,
  Row,
  Col,
} from "antd";
import { useFormik } from "formik";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from "uuid";
import coreAxios from "@/utils/axiosInstance";
import { CopyOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";

dayjs.extend(isBetween);

const BookingInfo = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prevData, setPrevData] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [currentBooking, setCurrentBooking] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const fetchRoomCategories = async () => {
    try {
      const response = await coreAxios.get("hotelCategory");
      setRoomCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };

  const fetchHotelInfo = async () => {
    try {
      const userRole = userInfo?.role?.value;
      const userHotelID = userInfo?.hotelID;
      const response = await coreAxios.get("hotel");

      if (Array.isArray(response.data)) {
        let hotelData = response.data;
        if (userRole === "hoteladmin" && userHotelID) {
          hotelData = hotelData.filter(
            (hotel) => hotel.hotelID === userHotelID
          );
        }
        setHotelInfo(hotelData);
      } else {
        setHotelInfo([]);
      }
    } catch (error) {
      message.error("Failed to fetch hotel information.");
    }
  };

  const fetchHotelCategories = async (value) => {
    const hotel = hotelInfo.find((hotel) => hotel.hotelID === value);
    if (hotel && hotel.roomCategories) {
      setRoomCategories(hotel.roomCategories);
    } else {
      setRoomCategories([]);
    }
  };

  const areDatesOverlapping = (checkInDate, checkOutDate, bookedDates) => {
    return bookedDates.some((bookedDate) => {
      const booked = dayjs(bookedDate);
      const checkIn = dayjs(checkInDate);
      const checkOut = dayjs(checkOutDate);

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
        if (roomNumber.bookedDates.length > 0) {
          const checkInDate = dayjs(formik.values.checkInDate);
          const checkOutDate = dayjs(formik.values.checkOutDate);
          const adjustedCheckOutDate = checkInDate.isSame(checkOutDate, "day")
            ? checkOutDate
            : checkOutDate.subtract(1, "day");

          const isOverlapping = areDatesOverlapping(
            checkInDate,
            adjustedCheckOutDate,
            roomNumber.bookedDates
          );
          return !isOverlapping;
        }
        return true;
      });
      setRoomNumbers(availableRooms);
    } else {
      setRoomNumbers([]);
    }
  };

  const updateRoomBookingStatus = async (values) => {
    setLoading(true);

    // Utility function to generate all dates between two dates
    const getBookedDates = (checkInDate, checkOutDate) => {
      const startDate = dayjs(checkInDate);
      const endDate = dayjs(checkOutDate);
      const bookedDates = [];

      for (let d = startDate; d.isBefore(endDate); d = d.add(1, "day")) {
        bookedDates.push(d.format("YYYY-MM-DD"));
      }
      return bookedDates;
    };

    // Properly parse payment amounts to numbers and calculate total paid
    const totalPaid = values.payments.reduce((sum, p) => {
      // Convert amount to number (handle empty/undefined cases)
      const amount = parseFloat(p.amount) || 0;
      return sum + amount;
    }, 0);

    // Calculate due payment (ensure it's never negative)
    const duePayment = Math.max(0, values.totalBill - totalPaid);

    const bookingUpdatePayload = {
      hotelID: values?.hotelID,
      categoryName: values?.roomCategoryName,
      roomName: values?.roomNumberName,
      booking: {
        name: values.roomNumberName,
        bookedDates: getBookedDates(values.checkInDate, values.checkOutDate),
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
              advancePayment: totalPaid,
              duePayment: duePayment,
              paymentMethod: values.paymentMethod,
              transactionId: values.transactionId,
            },
          },
        ],
      },
    };

    try {
      if (isEditing) {
        const deleteResponse = await coreAxios.delete("/bookings/delete", {
          data: {
            hotelID: prevData?.hotelID,
            categoryName: prevData?.roomCategoryName,
            roomName: prevData?.roomNumberName,
            datesToDelete: getAllDatesBetween(
              prevData?.checkInDate,
              prevData?.checkOutDate
            ),
          },
        });
        if (deleteResponse.status === 200) {
          await processBookingUpdate(bookingUpdatePayload, values);
        }
      } else {
        await processBookingUpdate(bookingUpdatePayload, values);
      }
    } catch (error) {
      message.error("An error occurred while updating the booking.");
    } finally {
      setLoading(false);
    }
  };

  // const updateRoomBookingStatus = async (values) => {
  //   setLoading(true);

  //   const getBookedDates = (checkInDate, checkOutDate) => {
  //     const startDate = dayjs(checkInDate);
  //     const endDate = dayjs(checkOutDate);
  //     const bookedDates = [];
  //     for (let d = startDate; d.isBefore(endDate); d = d.add(1, "day")) {
  //       bookedDates.push(d.format("YYYY-MM-DD"));
  //     }
  //     return bookedDates;
  //   };

  //   const bookingUpdatePayload = {
  //     hotelID: values?.hotelID,
  //     categoryName: values?.roomCategoryName,
  //     roomName: values?.roomNumberName,
  //     booking: {
  //       name: values.roomNumberName,
  //       bookedDates: getBookedDates(values.checkInDate, values.checkOutDate),
  //       bookings: [
  //         {
  //           guestName: values.fullName,
  //           checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
  //           checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
  //           bookedBy: values.bookedBy,
  //           adults: values?.adults,
  //           children: values?.children,
  //           paymentDetails: {
  //             totalBill: values.totalBill,
  //             advancePayment: values.advancePayment,
  //             duePayment: values.duePayment,
  //             paymentMethod: values.paymentMethod,
  //             transactionId: values.transactionId,
  //           },
  //         },
  //       ],
  //     },
  //   };

  //   try {
  //     if (isEditing) {
  //       const deleteResponse = await coreAxios.delete("/bookings/delete", {
  //         data: {
  //           hotelID: prevData?.hotelID,
  //           categoryName: prevData?.roomCategoryName,
  //           roomName: prevData?.roomNumberName,
  //           datesToDelete: getAllDatesBetween(
  //             prevData?.checkInDate,
  //             prevData?.checkOutDate
  //           ),
  //         },
  //       });
  //       if (deleteResponse.status === 200) {
  //         await processBookingUpdate(bookingUpdatePayload, values);
  //       }
  //     } else {
  //       await processBookingUpdate(bookingUpdatePayload, values);
  //     }
  //   } catch (error) {
  //     message.error("An error occurred while updating the booking.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
          hotelName: bookingDetails.hotelName,
          hotelID: bookingDetails.hotelID,
          roomCategoryName: bookingDetails.roomCategoryID,
          roomNumberName: bookingDetails.roomNumberName,
          roomPrice: bookingDetails.roomPrice,
          // checkInDate: checkInDate,
          // checkOutDate: checkOutDate,
          adults: bookingDetails.adults,
          children: bookingDetails.children,
          nights: bookingDetails.nights,
          totalBill: bookingDetails.totalBill,
          advancePayment: bookingDetails.advancePayment,
          duePayment: bookingDetails.duePayment,
          paymentMethod: bookingDetails.paymentMethod,
          transactionId: bookingDetails.transactionId,
          // note: bookingDetails.note,
        });
        message.success("Booking details loaded successfully!");
      }
    }
  };

  const processBookingUpdate = async (payload, values) => {
    const updateBookingResponse = await coreAxios.put(
      `/hotel/room/updateBooking`,
      payload
    );
    if (updateBookingResponse.status === 200) {
      const newBooking = {
        ...values,
        checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
        checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
        key: uuidv4(),
        bookingID: updateBookingResponse?.data?.hotel?._id,
      };

      const response = isEditing
        ? await coreAxios.put(`booking/${editingKey}`, newBooking)
        : await coreAxios.post("booking", newBooking);

      if (response.status === 200) {
        message.success("Booking created/updated successfully!");
        setVisible(false);
        setIsEditing(false);
        setEditingKey(null);
        fetchHotelInfo();
        fetchBookings();
      }
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
      isKitchen: false,
      kitchenTotalBill: 0,
      extraBedTotalBill: 0,
      extraBed: false,
      roomCategoryID: 0,
      roomCategoryName: "",
      roomNumberID: 0,
      roomNumberName: "",
      roomPrice: 0,
      checkInDate: dayjs(),
      nights: 0,
      totalBill: 0,
      advancePayment: 0,
      duePayment: 0,
      payments: [
        {
          method: "CASH", // Default method
          amount: "0",
          transactionId: "",
          date: new Date().toISOString(),
        },
      ],
      transactionId: "",
      note: "",
      bookedBy: userInfo ? userInfo?.username : "",
      bookedByID: userInfo ? userInfo?.loginID : "",
      updatedByID: "Not Updated",
      reference: "",
      adults: 0,
      children: 0,
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        // Calculate total payment amount
        const totalPaid = values.payments.reduce(
          (sum, p) => sum + (parseFloat(p.amount) || 0),
          0
        );

        // Validate that total paid doesn't exceed total bill
        if (totalPaid > values.totalBill) {
          message.error("Total payment amount cannot exceed total bill!");
          return;
        }

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
      const userRole = userInfo?.role?.value;
      const userHotelID = userInfo?.hotelID;
      const response = await coreAxios.get("bookings");

      if (response.status === 200) {
        let bookingsData = response?.data;
        if (userRole === "hoteladmin" && userHotelID) {
          bookingsData = bookingsData.filter(
            (booking) => booking.hotelID === userHotelID
          );
        }
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      }
    } catch (error) {
      message.error("Failed to fetch bookings.");
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
    const selectedHotel = hotelInfo.find((hotel) => hotel.hotelID === value);
    formik.setValues({
      ...formik.values,
      roomCategoryID: 0,
      roomCategoryName: "",
      roomNumberID: "",
      roomNumberName: "",
      hotelID: value,
      hotelName: selectedHotel?.hotelName || "",
    });
    fetchHotelCategories(value);
  };

  const handleRoomCategoryChange = (value) => {
    const selectedCategory = roomCategories.find(
      (category) => category._id === value
    );
    formik.setValues({
      ...formik.values,
      roomNumberID: 0,
      roomNumberName: "",
      roomCategoryID: value,
      roomCategoryName: selectedCategory?.name || "",
    });
    fetchRoomNumbers(value);
  };

  const handleEdit = (record) => {
    setEditingKey(record?._id);
    setPrevData(record);
    fetchHotelCategories(record?.hotelID);
    fetchRoomNumbers(record?.roomCategoryID);

    const checkInDate = dayjs(record.checkInDate);
    const checkOutDate = dayjs(record.checkOutDate);

    // Calculate total paid from payments array
    const totalPaid =
      record.payments?.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      ) || 0;
    formik.setValues({
      ...formik.values,
      bookedBy: record?.username,
      isKitchen: record?.isKitchen,
      kitchenTotalBill: record?.kitchenTotalBill,
      extraBed: record?.extraBed,
      extraBedTotalBill: record?.extraBedTotalBill,
      bookedByID: record?.loginID,
      updatedByID: userInfo?.loginID || "",
      fullName: record.fullName,
      nidPassport: record.nidPassport,
      address: record.address,
      phone: record.phone,
      email: record.email,
      hotelID: record.hotelID,
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
      payments: record.payments || [
        {
          method: record.paymentMethod || "CASH",
          amount: totalPaid.toString(),
          transactionId: record.transactionId || "",
          date: new Date().toISOString(),
        },
      ],
      note: record.note,
    });
    setVisible(true);
    setIsEditing(true);
  };

  const getAllDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }
    if (dayjs(startDate).date() !== 1) {
      dates.pop();
    }
    return dates;
  };

  const handleDelete2 = async (key) => {
    setLoading(true);
    try {
      const res = await coreAxios.put(`/booking/soft/${key}`, {
        canceledBy: userInfo?.loginID,
        reason: cancellationReason,
      });
      if (res.status === 200) {
        fetchBookings();
        message.success("Booking cancelled successfully.");
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInChange = (date) => {
    if (!isEditing) {
      formik.setValues({
        ...formik.values,
        hotelName: "",
        hotelID: 0,
        roomCategoryID: 0,
        roomCategoryName: "",
        roomNumberID: 0,
        roomNumberName: "",
        checkOutDate: "",
      });
    }
    formik.setFieldValue("checkInDate", date);
    calculateNights(date, formik.values.checkOutDate);
  };

  const handleCheckOutChange = (date) => {
    if (!isEditing) {
      formik.setValues({
        ...formik.values,
        hotelName: "",
        hotelID: 0,
        roomCategoryID: 0,
        roomCategoryName: "",
        roomNumberID: 0,
        roomNumberName: "",
      });
    }
    formik.setFieldValue("checkOutDate", date);
    calculateNights(formik.values.checkInDate, date);
  };

  const calculateNights = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      formik.setFieldValue("nights", diffDays);
    } else {
      formik.setFieldValue("nights", 0);
    }
  };

  const handleCancelReasonChange = (e) => {
    setCancellationReason(e.target.value);
  };

  const showModal = (booking) => {
    setCurrentBooking(booking);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!cancellationReason.trim()) {
      message.error("Please provide a reason for cancellation.");
      return;
    }

    setLoading(true);
    try {
      const deleteResponse = await coreAxios.delete("/bookings/delete", {
        data: {
          hotelID: currentBooking?.hotelID,
          categoryName: currentBooking?.roomCategoryName,
          roomName: currentBooking?.roomNumberName,
          bookingID: currentBooking?.bookingID,
          datesToDelete: getAllDatesBetween(
            currentBooking?.checkInDate,
            currentBooking?.checkOutDate
          ),
        },
      });

      if (deleteResponse.status === 200) {
        handleDelete2(currentBooking?._id);
      }
    } catch (error) {
      message.error("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (booking) => {
    showModal(booking);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    filterBookings(value, dateFilter);
  };

  const handleDateFilterChange = (date) => {
    setDateFilter(date);
    filterBookings(searchText, date);
  };

  const filterBookings = (searchValue, dateValue) => {
    let filteredData = bookings;

    // Apply text search filter
    if (searchValue) {
      filteredData = filteredData.filter(
        (r) =>
          r.bookingNo.toLowerCase().includes(searchValue) ||
          r.bookedByID.toLowerCase().includes(searchValue) ||
          r.fullName.toLowerCase().includes(searchValue) ||
          r.roomCategoryName.toLowerCase().includes(searchValue) ||
          r.roomNumberName.toLowerCase().includes(searchValue) ||
          r.hotelName.toLowerCase().includes(searchValue) ||
          r.phone.toLowerCase().includes(searchValue)
      );
    }

    // Apply date filter
    if (dateValue) {
      filteredData = filteredData.filter((booking) =>
        dayjs(booking.checkInDate).isSame(dateValue, "day")
      );
    }

    setFilteredBookings(filteredData);
    setPagination({ ...pagination, current: 1 });
  };
  const handleAdvancePaymentChange = (e) => {
    const advancePayment = e.target.value;
    s;
    const totalBill = formik.values.totalBill;

    // Calculate due payment
    const duePayment = totalBill - advancePayment;

    // Set the field values in formik
    formik.setFieldValue("advancePayment", advancePayment);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0); // Ensure due payment is non-negative
  };

  const handleHotelChange = (hotelID) => {
    setLoading(true);
    const selectedHotel = hotelInfo.find((hotel) => hotel.hotelID === hotelID);
    formik.setValues({
      ...formik.values,
      hotelID2: hotelID,
      hotelName2: selectedHotel?.hotelName || "",
    });

    const filteredData = bookings.filter(
      (booking) => booking.hotelID === hotelID
    );
    setFilteredBookings(filteredData);
    setPagination({ ...pagination, current: 1 });
    setLoading(false);
  };

  const paginatedBookings = filteredBookings.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const renderSkeleton = () => (
    <div className="p-4">
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  );

  return (
    <div>
      {loading && !bookings.length ? (
        renderSkeleton()
      ) : (
        <div className="">
          <div className="flex justify-between mb-4">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                gap: "16px",
                padding: "0 16px",
              }}
            >
              {/* Row container */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "16px",
                  width: "100%",
                  maxWidth: "1200px",
                }}
              >
                {/* Add New Booking Button */}
                <div
                  style={{
                    flex: "1 1 100%",
                    textAlign: "center",
                    minWidth: "200px",
                    maxWidth: "100%",
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      formik.resetForm();
                      setVisible(true);
                      setIsEditing(false);
                    }}
                    style={{
                      backgroundColor: "#8ABF55",
                      color: "white",
                      width: "100%",
                      maxWidth: "300px",
                    }}
                  >
                    Add New Booking
                  </Button>
                </div>

                {/* Date Picker */}
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                >
                  <DatePicker
                    placeholder="Filter by check-in date"
                    onChange={handleDateFilterChange}
                    allowClear
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Hotel Select */}
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                >
                  <Select
                    placeholder="Select a Hotel"
                    onChange={handleHotelChange}
                    style={{ width: "100%" }}
                  >
                    {hotelInfo.map((hotel) => (
                      <Select.Option key={hotel.hotelID} value={hotel.hotelID}>
                        {hotel.hotelName}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Search Input */}
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                >
                  <Input
                    placeholder="Search bookings..."
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-x-auto shadow-md mt-4">
            {loading ? (
              renderSkeleton()
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="w-full text-xs text-left rtl:text-right  dark:text-gray-400">
                    {/* Table Header */}
                    <thead className="text-xs  uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="border border-tableBorder text-center p-2">
                          Booking No.
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Invoice No.
                        </th>

                        <th className="border border-tableBorder text-center p-2">
                          Guest Name
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Phone
                        </th>
                        {/* <th className="border border-tableBorder text-center p-2">
                      Hotel
                    </th> */}
                        <th className="border border-tableBorder text-center p-2">
                          Flat Type
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Flat No/Unit
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Booking Date
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
                          Advance
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Total
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Status
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Confirm/Cancel By
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Updated By
                        </th>
                        <th className="border border-tableBorder text-center p-2">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {paginatedBookings?.map((booking, idx) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          style={{
                            backgroundColor:
                              booking.statusID === 255
                                ? "rgba(255, 99, 99, 0.5)"
                                : "",
                          }}
                        >
                          <td className="border border-tableBorder text-center p-2">
                            {booking?.serialNo}
                          </td>
                          {/* Booking No with Link and Copy Feature */}

                          <td className="border border-tableBorder text-center p-2">
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Link
                                target="_blank"
                                href={`/dashboard/${booking.bookingNo}`}
                                passHref
                              >
                                <p
                                  style={{
                                    color: "#1890ff",
                                    cursor: "pointer",
                                    marginRight: 8,
                                  }}
                                >
                                  {booking.bookingNo}
                                </p>
                              </Link>
                              <Tooltip title="Click to copy">
                                <CopyToClipboard
                                  text={booking.bookingNo}
                                  onCopy={() => message.success("Copied!")}
                                >
                                  <CopyOutlined
                                    style={{
                                      cursor: "pointer",
                                      color: "#1890ff",
                                    }}
                                  />
                                </CopyToClipboard>
                              </Tooltip>
                            </span>
                          </td>
                          {/* Booked By */}
                          {/* Guest Name */}
                          <td className="border border-tableBorder text-center p-2">
                            {booking.fullName}
                          </td>
                          <td className="border border-tableBorder text-center p-2">
                            {booking.phone}
                          </td>
                          {/* Hotel Name */}
                          {/* <td className="border border-tableBorder text-center p-2">
                        {booking.hotelName}
                      </td> */}
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
                            {moment(booking.createTime).format("D MMM YYYY")}
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
                          <td className="border border-tableBorder text-center p-2">
                            {booking.advancePayment}
                          </td>
                          {/* Total Bill */}
                          <td className="border border-tableBorder text-center p-2 font-bold text-green-900">
                            {booking.totalBill}
                          </td>
                          {/* Booking Status */}
                          <td
                            className="border border-tableBorder text-center p-2 font-bold"
                            style={{
                              color: booking.statusID === 255 ? "red" : "green", // Inline style for text color
                            }}
                          >
                            {booking.statusID === 255 ? (
                              <p>Canceled</p>
                            ) : (
                              "Confirmed"
                            )}
                          </td>
                          <td className="border border-tableBorder text-center p-2  text-green-900">
                            <p className="font-semibold">
                              {booking?.statusID === 255
                                ? booking?.canceledBy
                                : booking?.bookedByID}
                            </p>
                            {booking?.reason && (
                              <p className="text-[7px]">[{booking?.reason}]</p>
                            )}
                          </td>

                          <td className="border  border-tableBorder text-center   text-blue-900">
                            {booking?.updatedByID}{" "}
                            {booking?.updatedByID &&
                              dayjs(booking?.updatedAt).format(
                                "D MMM, YYYY (h:mm a)"
                              )}
                          </td>

                          {/* Actions */}
                          <td className="border border-tableBorder text-center p-2">
                            {booking?.statusID === 1 && (
                              <div className="flex">
                                <Button onClick={() => handleEdit(booking)}>
                                  Edit
                                </Button>
                                <Popconfirm
                                  title="Are you sure to delete this booking?"
                                  onConfirm={() => handleDelete(booking)}
                                >
                                  <Button type="link" danger>
                                    Cancel
                                  </Button>
                                </Popconfirm>
                              </div>
                            )}

                            {/* Cancellation Modal */}
                            <Modal
                              title="Cancel Booking"
                              visible={isModalVisible}
                              onOk={handleOk}
                              onCancel={handleCancel}
                              confirmLoading={loading}
                              okText="Confirm Cancellation"
                              cancelText="Cancel"
                              className="custom-modal"
                              // Apply backdrop filter to blur the background
                              destroyOnClose={true} // Optional: Clean up modal on close
                            >
                              <div>
                                <label htmlFor="reason" className="font-medium">
                                  Cancellation Reason:
                                </label>
                                <Input
                                  type="text"
                                  id="reason"
                                  value={cancellationReason}
                                  onChange={handleCancelReasonChange}
                                  placeholder="Enter cancellation reason"
                                  autoFocus
                                />
                              </div>
                            </Modal>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center p-2">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={filteredBookings?.length}
                    onChange={(page, pageSize) =>
                      setPagination({ current: page, pageSize })
                    }
                    className="mt-4"
                  />
                </div>
              </>
            )}
          </div>

          <Modal
            title={isEditing ? "Edit Booking" : "Create Booking"}
            open={visible}
            onCancel={() => setVisible(false)}
            footer={null}
            width={800}
          >
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
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="NID/Passport" className="mb-2">
                    <Input
                      name="nidPassport"
                      value={formik.values.nidPassport}
                      onChange={formik.handleChange}
                      required={false}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Address" className="mb-2">
                    <Input
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      required={false}
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
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Check In Date" className="mb-2">
                    <DatePicker
                      name="checkInDate"
                      value={formik.values.checkInDate}
                      required={true}
                      onChange={handleCheckInChange}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Check Out Date" className="mb-2">
                    <DatePicker
                      name="checkOutDate"
                      required={true}
                      value={formik.values.checkOutDate}
                      onChange={handleCheckOutChange}
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
                      onChange={handleHotelInfo}
                    >
                      {hotelInfo.map((hotel) => (
                        <Select.Option
                          key={hotel.hotelID}
                          value={hotel.hotelID}
                        >
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
                      onChange={handleRoomCategoryChange}
                    >
                      {roomCategories.map((category) => (
                        <Select.Option key={category._id} value={category._id}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Room Number" className="mb-2">
                    <Select
                      name="roomNumberID"
                      value={formik.values.roomNumberName}
                      onChange={(value) => {
                        const selectedRoom = roomNumbers.find(
                          (room) => room._id === value
                        );
                        formik.setFieldValue("roomNumberID", value);
                        formik.setFieldValue(
                          "roomNumberName",
                          selectedRoom ? selectedRoom.name : ""
                        );
                      }}
                    >
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
                      onChange={(e) => {
                        formik.handleChange(e);

                        // Calculate and update totalBill
                        const roomPrice = e.target.value;
                        const nights = formik.values.nights;
                        const kitchenTotalBill =
                          formik.values.kitchenTotalBill || 0;
                        const extraBedTotalBill =
                          formik.values.extraBedTotalBill || 0;

                        const totalBill =
                          (nights && roomPrice ? nights * roomPrice : 0) +
                          parseFloat(kitchenTotalBill) +
                          parseFloat(extraBedTotalBill);

                        formik.setFieldValue("totalBill", totalBill);
                      }}
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
                      required={false}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Number of Children" className="mb-2">
                    <Input
                      name="children"
                      value={formik.values.children}
                      onChange={formik.handleChange}
                      required={false}
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Number of Nights" className="mb-2">
                    <Input
                      name="nights"
                      value={formik.values.nights}
                      onChange={(e) => {
                        formik.handleChange(e);

                        // Calculate and update totalBill
                        const nights = e.target.value;
                        const roomPrice = formik.values.roomPrice;
                        const kitchenTotalBill =
                          formik.values.kitchenTotalBill || 0;
                        const extraBedTotalBill =
                          formik.values.extraBedTotalBill || 0;

                        const totalBill =
                          (nights && roomPrice ? nights * roomPrice : 0) +
                          parseFloat(kitchenTotalBill) +
                          parseFloat(extraBedTotalBill);

                        formik.setFieldValue("totalBill", totalBill);
                      }}
                      required={true}
                    />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Total Bill" className="mb-2">
                    <Input
                      name="totalBill"
                      value={formik.values.totalBill}
                      readOnly // Making this field read-only to prevent manual editing
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
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Payment Methods" className="mb-2">
                    {formik.values.payments.map((payment, index) => (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item label="Method" required={index === 0}>
                              <Select
                                value={payment.method}
                                onChange={(value) => {
                                  const payments = [...formik.values.payments];
                                  payments[index].method = value;
                                  formik.setFieldValue("payments", payments);
                                }}
                              >
                                <Select.n value="BKASH">BKASH</Select.n>
                                <Select.Option value="NAGAD">
                                  NAGAD
                                </Select.Option>
                                <Select.Option value="BKASH">
                                  BKASH
                                </Select.Option>
                                <Select.Option value="BANK">BANK</Select.Option>
                                <Select.Option value="CASH">CASH</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="Amount" required={index === 0}>
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => {
                                  const payments = [...formik.values.payments];
                                  payments[index].amount =
                                    parseFloat(e.target.value) || 0;
                                  formik.setFieldValue("payments", payments);

                                  // Recalculate totals
                                  const totalPaid = payments.reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.amount) || 0, 0)
                                  );
                                  formik.setFieldValue(
                                    "advancePayment",
                                    totalPaid
                                  );
                                  formik.setFieldValue(
                                    "duePayment",
                                    Math.max(
                                      0,
                                      formik.values.totalBill - totalPaid
                                    )
                                  );
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              label="Transaction ID"
                              required={index === 0}
                            >
                              <Input
                                value={payment.transactionId}
                                onChange={(e) => {
                                  const payments = [...formik.values.payments];
                                  payments[index].transactionId =
                                    e.target.value;
                                  formik.setFieldValue("payments", payments);
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}

                    {formik.values.payments.length < 3 && (
                      <Button
                        type="dashed"
                        onClick={() => {
                          formik.setFieldValue("payments", [
                            ...formik.values.payments,
                            { method: "", amount: "", transactionId: "" },
                          ]);
                        }}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Payment Method
                      </Button>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <strong>Total Paid: </strong>
                      {formik.values.payments.reduce(
                        (sum, p) => sum + (parseFloat(p.amount) || 0),
                        0
                      )}
                      {formik.values.payments.reduce(
                        (sum, p) => sum + (parseFloat(p.amount) || 0),
                        0
                      ) > formik.values.totalBill && (
                        <Alert
                          message="Total payment amount exceeds total bill!"
                          type="error"
                          showIcon
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </div>
                  </Form.Item>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                {/* Other fields in this row */}
                <div style={{ flex: 1 }}>
                  <Form.Item label="Is Kitchen?" className="mb-2">
                    <Switch
                      checked={formik.values.isKitchen} // Use formik's value for isKitchen
                      onChange={(checked) =>
                        formik.setFieldValue("isKitchen", checked)
                      } // Update formik value on switch toggle
                    />
                  </Form.Item>
                  {formik.values.isKitchen && ( // Conditionally render totalBill field if isKitchen is true
                    <Form.Item label="Total Bill (Kitchen)" className="mb-2">
                      <Input
                        type="number"
                        value={formik.values.kitchenTotalBill || ""}
                        onChange={(e) => {
                          formik.setFieldValue(
                            "kitchenTotalBill",
                            e.target.value
                          );

                          // Recalculate totalBill
                          const kitchenTotalBill = e.target.value || 0;
                          const nights = formik.values.nights || 0;
                          const roomPrice = formik.values.roomPrice || 0;
                          const extraBedTotalBill =
                            formik.values.extraBedTotalBill || 0;

                          const totalBill =
                            (nights && roomPrice ? nights * roomPrice : 0) +
                            parseFloat(kitchenTotalBill) +
                            parseFloat(extraBedTotalBill);

                          formik.setFieldValue("totalBill", totalBill);
                        }}
                      />
                    </Form.Item>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item label="Extra Bed?" className="mb-2">
                    <Switch
                      checked={formik.values.extraBed} // Use formik's value for extraBed
                      onChange={(checked) =>
                        formik.setFieldValue("extraBed", checked)
                      } // Update formik value on switch toggle
                    />
                  </Form.Item>
                  {formik.values.extraBed && ( // Conditionally render totalBill field if extraBed is true
                    <Form.Item label="Total Bill (Extra Bed)" className="mb-2">
                      <Input
                        type="number"
                        value={formik.values.extraBedTotalBill || ""}
                        onChange={(e) => {
                          formik.setFieldValue(
                            "extraBedTotalBill",
                            e.target.value
                          );

                          // Recalculate totalBill
                          const extraBedTotalBill = e.target.value || 0;
                          const nights = formik.values.nights || 0;
                          const roomPrice = formik.values.roomPrice || 0;
                          const kitchenTotalBill =
                            formik.values.kitchenTotalBill || 0;

                          const totalBill =
                            (nights && roomPrice ? nights * roomPrice : 0) +
                            parseFloat(kitchenTotalBill) +
                            parseFloat(extraBedTotalBill);

                          formik.setFieldValue("totalBill", totalBill);
                        }}
                      />
                    </Form.Item>
                  )}
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
                className="bg-[#8ABF55] hover:bg-[#7DA54E]"
              >
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

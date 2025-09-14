"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
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
} from "antd";
import { useFormik } from "formik";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { v4 as uuidv4 } from "uuid";
import { CopyOutlined } from "@ant-design/icons";
import Link from "next/link";

// Mock axios instance for demonstration
const coreAxios = {
  get: async (url) => {
    // Mock implementation for demonstration
    console.log(`GET request to: ${url}`);
    return { data: [], status: 200 };
  },
  put: async (url, data) => {
    console.log(`PUT request to: ${url}`, data);
    return { status: 200 };
  },
  post: async (url, data) => {
    console.log(`POST request to: ${url}`, data);
    return { status: 200 };
  },
  delete: async (url, config) => {
    console.log(`DELETE request to: ${url}`, config);
    return { status: 200 };
  },
};

// Mock NoPermissionBanner component
const NoPermissionBanner = () => (
  <div className="p-4 bg-red-100 text-red-800 rounded-md">
    You don't have permission to view this page.
  </div>
);

const BookingInfo = ({ hotelID }) => {
  // Mock user info
  const userInfo2 = {
    permission: {
      permissions: [
        {
          pageName: "Booking",
          viewAccess: true,
          insertAccess: true,
          editAccess: true,
          deleteAccess: true,
        },
      ],
    },
  };

  const userHotelID = hotelID;
  const permission = userInfo2?.permission?.permissions;
  const bookingPermissions =
    permission?.find((perm) => perm.pageName === "Booking") || {};

  const [visible, setVisible] = useState(false);
  const [selectedHotel2, setSelectedHotel2] = useState(null);
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
  const [prevData, setPrevData] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [currentBooking, setCurrentBooking] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [checkInFilter, setCheckInFilter] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    // Mock hotel data
    setHotelInfo([
      { hotelID: 1, hotelName: "Grand Hotel", roomCategories: [] },
      { hotelID: 2, hotelName: "Beach Resort", roomCategories: [] },
    ]);

    // Mock booking data
    const mockBookings = [
      {
        _id: "1",
        bookingNo: "BKG-001",
        serialNo: "001",
        fullName: "John Doe",
        phone: "123-456-7890",
        hotelName: "Grand Hotel",
        roomCategoryName: "Deluxe",
        roomNumberName: "101",
        checkInDate: "2023-10-15",
        checkOutDate: "2023-10-20",
        nights: 5,
        advancePayment: 100,
        totalBill: 500,
        statusID: 1,
        bookedByID: "user123",
        updatedByID: "user123",
        createTime: "2023-10-10",
        roomPrice: 100,
        adults: 2,
        children: 1,
        paymentMethod: "Credit Card",
        transactionId: "TX123",
        note: "Test booking",
        hotelID: 1,
        roomCategoryID: "cat1",
        roomNumberID: "room1",
      },
      {
        _id: "2",
        bookingNo: "BKG-002",
        serialNo: "002",
        fullName: "Jane Smith",
        phone: "098-765-4321",
        hotelName: "Beach Resort",
        roomCategoryName: "Suite",
        roomNumberName: "201",
        checkInDate: "2023-10-18",
        checkOutDate: "2023-10-22",
        nights: 4,
        advancePayment: 150,
        totalBill: 600,
        statusID: 1,
        bookedByID: "user456",
        updatedByID: "user456",
        createTime: "2023-10-12",
        roomPrice: 150,
        adults: 1,
        children: 0,
        paymentMethod: "PayPal",
        transactionId: "TX456",
        note: "Another test booking",
        hotelID: 2,
        roomCategoryID: "cat2",
        roomNumberID: "room2",
      },
      {
        _id: "3",
        bookingNo: "BKG-003",
        serialNo: "003",
        fullName: "Bob Johnson",
        phone: "555-123-4567",
        hotelName: "Grand Hotel",
        roomCategoryName: "Standard",
        roomNumberName: "102",
        checkInDate: "2023-10-15", // Same check-in date as first booking
        checkOutDate: "2023-10-17",
        nights: 2,
        advancePayment: 50,
        totalBill: 200,
        statusID: 255, // Canceled
        bookedByID: "user789",
        updatedByID: "user789",
        createTime: "2023-10-08",
        roomPrice: 100,
        adults: 1,
        children: 0,
        paymentMethod: "Cash",
        transactionId: "TX789",
        note: "Canceled booking",
        hotelID: 1,
        roomCategoryID: "cat3",
        roomNumberID: "room3",
        canceledBy: "admin",
        reason: "Changed plans",
      },
    ];

    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
  }, []);

  const fetchRoomCategories = async () => {
    try {
      const response = await coreAxios.get("hotelCategory");
      if (Array.isArray(response.data)) {
        setRoomCategories(response.data);
      } else {
        setRoomCategories([]);
      }
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };

  const fetchHotelInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userRole = userInfo?.role?.value;
      const userHotelID = Number(hotelID);

      const response = await coreAxios.get("hotel");

      if (Array.isArray(response.data)) {
        let hotelData = response.data;

        if (userRole !== "superAdmin" && userHotelID) {
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

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const updateRoomBookingStatus = async (values) => {
    setLoading(true);

    const getBookedDates = (checkInDate, checkOutDate) => {
      const startDate = dayjs(checkInDate);
      const endDate = dayjs(checkOutDate);
      const bookedDates = [];

      for (let d = startDate; d.isBefore(endDate); d = d.add(1, "day")) {
        bookedDates.push(d.format("YYYY-MM-DD"));
      }
      return bookedDates;
    };

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
              advancePayment: values.advancePayment,
              duePayment: values.duePayment,
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
          const updateBookingResponse = await coreAxios.put(
            `/hotel/room/updateBooking`,
            bookingUpdatePayload
          );

          if (updateBookingResponse.status === 200) {
            const newBooking = {
              ...values,
              checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
              checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
              key: uuidv4(),
              bookingID: updateBookingResponse?.data?.hotel?._id,
            };

            let response;
            if (isEditing) {
              response = await coreAxios.put(
                `booking/${editingKey}`,
                newBooking
              );
            } else {
              response = await coreAxios.post("booking", newBooking);
            }

            if (response.status === 200) {
              message.success("Booking created/updated successfully!");
            } else {
              message.error("Failed to create/update booking.");
            }

            setVisible(false);
            setIsEditing(false);
            setEditingKey(null);
            setBookings([]);
            setFilteredBookings([]);
            message.success("Room booking status updated successfully!");

            fetchHotelInfo();
            fetchBookings();
            if (updateBookingResponse.status === 200) {
              const newBooking = {
                ...values,
                checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
                checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
                key: uuidv4(),
                bookingID: updateBookingResponse?.data?.hotel?._id,
              };

              let response;
              if (isEditing) {
                response = await coreAxios.put(
                  `booking/${editingKey}`,
                  newBooking
                );
              } else {
                response = await coreAxios.post("booking", newBooking);
              }

              if (response.status === 200) {
                message.success("Booking created/updated successfully!");
              } else {
                message.error("Failed to create/update booking.");
              }

              setVisible(false);
              setIsEditing(false);
              setEditingKey(null);
              setBookings([]);
              setFilteredBookings([]);
              message.success("Room booking status updated successfully!");

              fetchHotelInfo();
              fetchBookings();
            } else {
              message.error("Failed to update room booking status.");
            }
          } else {
            message.error("Failed to update room booking status.");
          }
        }
      } else {
        const updateBookingResponse = await coreAxios.put(
          `/hotel/room/updateBooking`,
          bookingUpdatePayload
        );
        if (updateBookingResponse.status === 200) {
          const newBooking = {
            ...values,
            checkIn: dayjs(values.checkInDate).format("YYYY-MM-DD"),
            checkOut: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
            key: uuidv4(),
            bookingID: updateBookingResponse?.data?.hotel?._id,
          };

          let response;
          if (isEditing) {
            response = await coreAxios.put(`booking/${editingKey}`, newBooking);
          } else {
            response = await coreAxios.post("booking", newBooking);
          }

          if (response.status === 200) {
            message.success("Booking created/updated successfully!");
          } else {
            message.error("Failed to create/update booking.");
          }

          setVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          setBookings([]);
          setFilteredBookings([]);
          message.success("Room booking status updated successfully!");

          fetchHotelInfo();
          fetchBookings();
        } else {
          message.error("Failed to update room booking status.");
        }
      }
    } catch (error) {
      message.error("An error occurred while updating the booking.");
    } finally {
      setLoading(false);
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
      paymentMethod: "",
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
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userRole = userInfo?.role?.value;
      const userHotelID = hotelID;

      const response = await coreAxios.get("bookings");

      if (response.status === 200) {
        let bookingsData = response?.data;

        if (userRole === "hoteladmin" && userHotelID) {
          bookingsData = bookingsData.filter(
            (booking) => booking.hotelID === Number(userHotelID)
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
    const selectedHotel = hotelInfo.find((hotel) => hotel.hotelID === value);

    formik.setFieldValue("roomCategoryID", 0);
    formik.setFieldValue("roomCategoryName", "");
    formik.setFieldValue("roomNumberID", "");
    formik.setFieldValue("roomNumberName", "");
    formik.setFieldValue("hotelID", value);
    formik.setFieldValue(
      "hotelName",
      selectedHotel ? selectedHotel.hotelName : ""
    );
    fetchHotelCategories(value);
  };

  const handleRoomCategoryChange = (value) => {
    const selectedCategory = roomCategories.find(
      (category) => category._id === value
    );

    formik.setFieldValue("roomNumberID", 0);
    formik.setFieldValue("roomNumberName", "");
    formik.setFieldValue("roomCategoryID", value);
    formik.setFieldValue(
      "roomCategoryName",
      selectedCategory ? selectedCategory.name : ""
    );
    fetchRoomNumbers(value);
  };

  const handleEdit = (record) => {
    setEditingKey(record?._id);
    setPrevData(record);
    fetchHotelCategories(record?.hotelID);
    fetchRoomNumbers(record?.roomCategoryID);

    const checkInDate = dayjs(record.checkInDate);
    const checkOutDate = dayjs(record.checkOutDate);
    if (record) {
      formik.setValues({
        ...formik.values,
        bookedBy: record?.username,
        isKitchen: record?.isKitchen,
        kitchenTotalBill: record?.kitchenTotalBill,
        extraBed: record?.extraBed,
        extraBedTotalBill: record?.extraBedTotalBill,
        bookedByID: record?.loginID,
        updatedByID: userInfo ? userInfo?.loginID : "",
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
        paymentMethod: record.paymentMethod,
        transactionId: record.transactionId,
        note: record.note,
      });
    }
    setVisible(true);
    setIsEditing(true);
  };

  function getAllDatesBetween(startDate, endDate) {
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
  }

  const handleDelete2 = async (key) => {
    setLoading(true);
    try {
      const canceledBy = userInfo?.loginID;

      const res = await coreAxios.put(`/booking/soft/${key}`, {
        canceledBy: canceledBy,
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

  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    formik.setFieldValue(name, value);

    const roomPrice = name === "roomPrice" ? value : formik.values.roomPrice;
    const nights = name === "nights" ? value : formik.values.nights;
    const totalBill = roomPrice * nights;

    const advancePayment = formik.values.advancePayment || 0;
    const duePayment = totalBill - advancePayment;

    formik.setFieldValue("totalBill", totalBill);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0);
  };

  const handleNightsChange = (e) => {
    const nights = parseInt(e.target.value) || 0;
    formik.setFieldValue("nights", nights);

    const roomPrice = formik.values.roomPrice || 0;
    const totalBill = roomPrice * nights;

    let advancePayment = parseFloat(formik.values.advancePayment) || 0;

    if (advancePayment > totalBill) {
      advancePayment = totalBill;
    }

    const duePayment = totalBill - advancePayment;

    formik.setFieldValue("totalBill", totalBill);
    formik.setFieldValue("advancePayment", advancePayment);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0);
  };

  const handleAdvancePaymentChange = (e) => {
    const advancePayment = e.target.value;
    const totalBill = formik.values.totalBill;

    const duePayment = totalBill - advancePayment;

    formik.setFieldValue("advancePayment", advancePayment);
    formik.setFieldValue("duePayment", duePayment >= 0 ? duePayment : 0);
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Global search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    applyFilters(value, checkInFilter);
  };

  // Handle check-in date filter change
  const handleCheckInFilterChange = (date) => {
    setCheckInFilter(date);
    applyFilters(searchText, date);
  };

  // Clear check-in date filter
  const clearCheckInFilter = () => {
    setCheckInFilter(null);
    applyFilters(searchText, null);
  };

  // Apply all filters (search text and check-in date)
  const applyFilters = (searchValue, checkInDate) => {
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

    // Apply check-in date filter
    if (checkInDate) {
      const filterDate = dayjs(checkInDate).format("YYYY-MM-DD");
      filteredData = filteredData.filter((booking) => {
        const bookingCheckIn = dayjs(booking.checkInDate).format("YYYY-MM-DD");
        return bookingCheckIn === filterDate;
      });
    }

    setFilteredBookings(filteredData);
    setPagination({ ...pagination, current: 1 });
  };

  const paginatedBookings = filteredBookings.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const fetchBookingDetails = async (bookingNo) => {
    try {
      const response = await coreAxios.get(`/bookings/bookingNo/${bookingNo}`);
      if (response?.status === 200) {
        await fetchHotelCategories(response?.data?.[0]?.hotelID);
      }
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
          hotelName: bookingDetails.hotelName,
          hotelID: bookingDetails.hotelID,
          roomCategoryName: bookingDetails.roomCategoryID,
          roomNumberName: bookingDetails.roomNumberName,
          roomPrice: bookingDetails.roomPrice,
          adults: bookingDetails.adults,
          children: bookingDetails.children,
          nights: bookingDetails.nights,
          totalBill: bookingDetails.totalBill,
          advancePayment: bookingDetails.advancePayment,
          duePayment: bookingDetails.duePayment,
          paymentMethod: bookingDetails.paymentMethod,
          transactionId: bookingDetails.transactionId,
        });
        message.success("Booking details loaded successfully!");
      }
    }
  };

  const handleHotelChange = (hotelID) => {
    setLoading(true);
    setSelectedHotel2(hotelID);

    const selectedHotel = hotelInfo.find((hotel) => hotel.hotelID === hotelID);

    formik.setFieldValue("hotelID2", hotelID);
    formik.setFieldValue(
      "hotelName2",
      selectedHotel ? selectedHotel.hotelName : ""
    );

    const filteredData = bookings.filter(
      (booking) => booking.hotelID === hotelID
    );

    setFilteredBookings(filteredData);
    setPagination({ ...pagination, current: 1 });

    setLoading(false);
  };

  // night calculations
  const handleCheckInChange = (date) => {
    if (!isEditing) {
      formik.setFieldValue("hotelName", "");
      formik.setFieldValue("hotelID", 0);
      formik.setFieldValue("roomCategoryID", 0);
      formik.setFieldValue("roomCategoryName", "");
      formik.setFieldValue("roomNumberID", 0);
      formik.setFieldValue("roomNumberName", "");
      formik.setFieldValue("checkOutDate", "");
    }
    formik.setFieldValue("checkInDate", date);
    calculateNights(date, formik.values.checkOutDate);
  };

  const handleCheckOutChange = (date) => {
    if (!isEditing) {
      formik.setFieldValue("hotelName", "");
      formik.setFieldValue("hotelID", 0);
      formik.setFieldValue("roomCategoryID", 0);
      formik.setFieldValue("roomCategoryName", "");
      formik.setFieldValue("roomNumberID", 0);
      formik.setFieldValue("roomNumberName", "");
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

  return (
    <div>
      {bookingPermissions.viewAccess ? (
        <>
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
                  {bookingPermissions?.insertAccess && (
                    <Button
                      type="primary"
                      onClick={() => {
                        formik.resetForm();
                        setVisible(true);
                        setIsEditing(false);
                      }}
                      className="mb-4 bg-[#8ABF55] hover:bg-[#7DA54E] text-white"
                    >
                      Add New Booking
                    </Button>
                  )}

                  {/* Hotel Selection Dropdown */}
                  <Select
                    name="hotelName2"
                    placeholder="Select a Hotel"
                    value={formik.values.hotelName2}
                    style={{ width: 300 }}
                    onChange={handleHotelChange}
                  >
                    {hotelInfo.map((hotel) => (
                      <Select.Option key={hotel.hotelID} value={hotel.hotelID}>
                        {hotel.hotelName}
                      </Select.Option>
                    ))}
                  </Select>

                  {/* Filter Section */}
                  <div className="flex gap-2">
                    {/* Check-in Date Filter */}
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">
                        Check-in Date
                      </label>
                      <DatePicker
                        value={checkInFilter}
                        onChange={handleCheckInFilterChange}
                        placeholder="Filter by check-in date"
                        style={{ width: 180 }}
                        allowClear
                        onClear={clearCheckInFilter}
                      />
                    </div>

                    {/* Global Search Input */}
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">
                        Search
                      </label>
                      <Input
                        placeholder="Search bookings..."
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: 200 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Display active filters */}
                {(searchText || checkInFilter) && (
                  <div className="mb-4 p-2 bg-gray-100 rounded">
                    <span className="text-sm text-gray-600">
                      Active filters:{" "}
                    </span>
                    {searchText && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                        Search: "{searchText}"
                      </span>
                    )}
                    {checkInFilter && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                        Check-in: {dayjs(checkInFilter).format("MMM D, YYYY")}
                      </span>
                    )}
                    <Button
                      size="small"
                      onClick={() => {
                        setSearchText("");
                        setCheckInFilter(null);
                        setFilteredBookings(bookings);
                      }}
                      className="ml-2"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                <div className="relative overflow-x-auto shadow-md">
                  <div style={{ overflowX: "auto" }}>
                    <table className="w-full text-xs text-left rtl:text-right dark:text-gray-400">
                      {/* Table Header */}
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                            {/* Guest Name */}
                            <td className="border border-tableBorder text-center p-2">
                              {booking.fullName}
                            </td>
                            <td className="border border-tableBorder text-center p-2">
                              {booking.phone}
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
                              {moment(booking.createTime).format("D MMM YYYY")}
                            </td>
                            {/* Check In */}
                            <td className="border border-tableBorder text-center p-2">
                              {moment(booking.checkInDate).format("D MMM YYYY")}
                            </td>
                            {/* Check Out */}
                            <td className="border border-tableBorder text-center p-2">
                              {moment(booking.checkOutDate).format(
                                "D MMM YYYY"
                              )}
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
                                color:
                                  booking.statusID === 255 ? "red" : "green",
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
                                <p className="text-[7px]">
                                  [{booking?.reason}]
                                </p>
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
                                  {bookingPermissions?.editAccess && (
                                    <Button onClick={() => handleEdit(booking)}>
                                      Edit
                                    </Button>
                                  )}
                                  {bookingPermissions?.deleteAccess && (
                                    <Popconfirm
                                      title="Are you sure to delete this booking?"
                                      onConfirm={() => handleDelete(booking)}
                                    >
                                      <Button type="link" danger>
                                        Cancel
                                      </Button>
                                    </Popconfirm>
                                  )}
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
                                destroyOnClose={true}
                              >
                                <div>
                                  <label
                                    htmlFor="reason"
                                    className="font-medium"
                                  >
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
                            onBlur={handleBlur}
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
                              <Select.Option
                                key={category._id}
                                value={category._id}
                              >
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
                            readOnly
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
                        <Form.Item label="Payment Method" className="mb-2">
                          <Select
                            required={true}
                            name="paymentMethod"
                            value={formik.values.paymentMethod}
                            onChange={(value) =>
                              formik.setFieldValue("paymentMethod", value)
                            }
                          >
                            <Select.Option value="BKASH">BKASH</Select.Option>
                            <Select.Option value="NAGAD">NAGAD</Select.Option>
                            <Select.Option value="BANK">BANK</Select.Option>
                            <Select.Option value="CASH">CASH</Select.Option>
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
                        <Form.Item label="Is Kitchen?" className="mb-2">
                          <Switch
                            checked={formik.values.isKitchen}
                            onChange={(checked) =>
                              formik.setFieldValue("isKitchen", checked)
                            }
                          />
                        </Form.Item>
                        {formik.values.isKitchen && (
                          <Form.Item
                            label="Total Bill (Kitchen)"
                            className="mb-2"
                          >
                            <Input
                              type="number"
                              value={formik.values.kitchenTotalBill || ""}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  "kitchenTotalBill",
                                  e.target.value
                                );

                                const kitchenTotalBill = e.target.value || 0;
                                const nights = formik.values.nights || 0;
                                const roomPrice = formik.values.roomPrice || 0;
                                const extraBedTotalBill =
                                  formik.values.extraBedTotalBill || 0;

                                const totalBill =
                                  (nights && roomPrice
                                    ? nights * roomPrice
                                    : 0) +
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
                            checked={formik.values.extraBed}
                            onChange={(checked) =>
                              formik.setFieldValue("extraBed", checked)
                            }
                          />
                        </Form.Item>
                        {formik.values.extraBed && (
                          <Form.Item
                            label="Total Bill (Extra Bed)"
                            className="mb-2"
                          >
                            <Input
                              type="number"
                              value={formik.values.extraBedTotalBill || ""}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  "extraBedTotalBill",
                                  e.target.value
                                );

                                const extraBedTotalBill = e.target.value || 0;
                                const nights = formik.values.nights || 0;
                                const roomPrice = formik.values.roomPrice || 0;
                                const kitchenTotalBill =
                                  formik.values.kitchenTotalBill || 0;

                                const totalBill =
                                  (nights && roomPrice
                                    ? nights * roomPrice
                                    : 0) +
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
        </>
      ) : (
        <>
          <NoPermissionBanner />
        </>
      )}
    </div>
  );
};

export default BookingInfo;

"use client";
import React, { useState, useEffect } from "react";
import { Select, DatePicker, Button, Spin, Alert, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import coreAxios from "@/utils/axiosInstance";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AllBookingInfo = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotelInformation();
    // fetchBookings();
  }, []);

  const fetchHotelInformation = async () => {
    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userRole = userInfo?.role?.value;
      const userHotelID = userInfo?.hotelID;

      const res = await coreAxios.get(`hotel`);
      setLoading(false);

      if (res?.status === 200) {
        let hotelData = res?.data;

        if (userRole === "hoteladmin" && userHotelID) {
          hotelData = hotelData.filter(
            (hotel) => hotel.hotelID === userHotelID
          );
        }

        setHotels(hotelData);
      }
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch hotel data", error);
      message.error("Failed to load hotels. Please try again.");
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userRole = userInfo?.role?.value;
      const userHotelID = userInfo?.hotelID;

      const response = await coreAxios.get("bookings");

      if (response.status === 200) {
        const filtered = response?.data?.filter(
          (data) => data.statusID !== 255
        );

        let bookingsData = filtered;

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!selectedHotel && !dates.length) {
      setFilteredBookings(bookings);
      return;
    }

    const [startDate, endDate] = dates.map((date) =>
      dayjs(date).format("YYYY-MM-DD")
    );

    const filtered = bookings.filter((booking) => {
      const matchHotel = selectedHotel
        ? booking.hotelName === selectedHotel
        : true;
      const matchDate =
        dates.length > 0
          ? dayjs(booking.checkInDate).isBetween(
              startDate,
              endDate,
              "day",
              "[]"
            ) ||
            dayjs(booking.checkOutDate).isBetween(
              startDate,
              endDate,
              "day",
              "[]"
            )
          : true;

      return matchHotel && matchDate;
    });

    setFilteredBookings(filtered);
  };

  const exportToExcel = () => {
    if (!filteredBookings.length) {
      message.error("No data to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredBookings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, `Bookings_${dayjs().format("YYYYMMDD")}.xlsx`);
  };

  const exportToPDF = () => {
    if (!filteredBookings.length) {
      message.error("No data to export.");
      return;
    }

    const doc = new jsPDF();
    const columns = [
      "Booking No",
      "Full Name",
      "Check-In Date",
      "Check-Out Date",
      "Hotel Name",
      "Room",
      "Total Bill",
      "Advance Payment",
      "Due Payment",
    ];
    const rows = filteredBookings.map((booking) => [
      booking.bookingNo,
      booking.fullName,
      dayjs(booking.checkInDate).format("DD MMM YYYY"),
      dayjs(booking.checkOutDate).format("DD MMM YYYY"),
      booking.hotelName,
      `${booking.roomCategoryName} (${booking.roomNumberName})`,
      booking.totalBill,
      booking.advancePayment,
      booking.duePayment,
    ]);

    doc.text("Booking Information", 14, 10);
    doc.autoTable({ head: [columns], body: rows, startY: 20 });
    doc.save(`Bookings_${dayjs().format("YYYYMMDD")}.pdf`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3
        style={{
          color: "#38a169",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "24px",
          marginBottom: "20px",
        }}>
        Booking Information
      </h3>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Select
          placeholder="Select Hotel"
          style={{ width: "25%" }}
          value={selectedHotel}
          onChange={(value) => setSelectedHotel(value)}>
          {hotels.map((hotel) => (
            <Option key={hotel.hotelID} value={hotel.hotelName}>
              {hotel.hotelName}
            </Option>
          ))}
        </Select>

        <RangePicker
          value={dates}
          onChange={(dates) => setDates(dates || [])}
          style={{ width: "50%" }}
        />

        <Button type="primary" onClick={filterBookings}>
          Apply Filters
        </Button>

        <Button
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
          disabled={!filteredBookings.length}>
          Export to Excel
        </Button>

        <Button
          icon={<DownloadOutlined />}
          onClick={exportToPDF}
          disabled={!filteredBookings.length}>
          Export to PDF
        </Button>
      </div>

      {loading ? (
        <Spin style={{ marginTop: "20px" }} tip="Loading, please wait...">
          <Alert
            message="Fetching booking data"
            description="This may take a moment, thank you for your patience."
            type="info"
          />
        </Spin>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Booking No</th>
              <th>Full Name</th>
              <th>Check-In Date</th>
              <th>Check-Out Date</th>
              <th>Hotel Name</th>
              <th>Room</th>
              <th>Total Bill</th>
              <th>Advance Payment</th>
              <th>Due Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.bookingNo}</td>
                  <td>{booking.fullName}</td>
                  <td>{dayjs(booking.checkInDate).format("DD MMM YYYY")}</td>
                  <td>{dayjs(booking.checkOutDate).format("DD MMM YYYY")}</td>
                  <td>{booking.hotelName}</td>
                  <td>
                    {booking.roomCategoryName} ({booking.roomNumberName})
                  </td>
                  <td>{booking.totalBill}</td>
                  <td>{booking.advancePayment}</td>
                  <td>{booking.duePayment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No bookings available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllBookingInfo;

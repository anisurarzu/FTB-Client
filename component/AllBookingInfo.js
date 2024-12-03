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

        // setBookings(bookingsData);
        // setFilteredBookings(bookingsData);
        // filterBookings();

        if (!selectedHotel && !dates.length) {
          setFilteredBookings(bookings);
          return;
        }

        const [startDate, endDate] = dates.map((date) =>
          dayjs(date).format("YYYY-MM-DD")
        );

        const filtered2 = bookingsData?.filter((booking) => {
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

        setFilteredBookings(filtered2);
      }
    } catch (error) {
      message.error("Failed to fetch bookings.");
      console.error(error);
    } finally {
      setLoading(false);
    }
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

        <Button type="primary" onClick={fetchBookings}>
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
              <th style={{ border: "1px solid black" }}>Booking No</th>
              <th style={{ border: "1px solid black" }}>Full Name</th>
              <th style={{ border: "1px solid black" }}>Check-In Date</th>
              <th style={{ border: "1px solid black" }}>Check-Out Date</th>
              <th style={{ border: "1px solid black" }}>Hotel Name</th>
              <th style={{ border: "1px solid black" }}>Room</th>
              <th style={{ border: "1px solid black" }}>Total Bill</th>
              <th style={{ border: "1px solid black" }}>Advance Payment</th>
              <th style={{ border: "1px solid black" }}>Due Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td style={{ border: "1px solid black" }}>
                    {booking.bookingNo}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.fullName}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {dayjs(booking.checkInDate).format("DD MMM YYYY")}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {dayjs(booking.checkOutDate).format("DD MMM YYYY")}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.hotelName}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.roomCategoryName} ({booking.roomNumberName})
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.totalBill}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.advancePayment}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {booking.duePayment}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: "center", border: "1px solid black" }}>
                  No bookings available.
                </td>
              </tr>
            )}

            {/* Summary Row for Totals */}
            {filteredBookings.length > 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid black",
                  }}>
                  Total:
                </td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                  {filteredBookings.reduce(
                    (sum, booking) => sum + booking.totalBill,
                    0
                  )}
                </td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                  {filteredBookings.reduce(
                    (sum, booking) => sum + booking.advancePayment,
                    0
                  )}
                </td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>
                  {filteredBookings.reduce(
                    (sum, booking) => sum + booking.duePayment,
                    0
                  )}
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

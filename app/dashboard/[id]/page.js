"use client";

import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Button, QRCode, Watermark, message } from "antd";
import html2pdf from "html2pdf.js";
import axios from "axios";
import Image from "next/image";
import coreAxios from "@/utils/axiosInstance";
import moment from "moment"; // Add moment for date formatting

const Invoice = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    totalAdvance: 0,
    totalDue: 0,
    totalBill: 0,
  }); 
  const { id } = params;

  const fetchInvoiceInfo = async () => {
    try {
      setLoading(true);
      const response = await coreAxios.get(`/bookings/bookingNo/${id}`);
      if (response?.status === 200) {
        calculateTotals(response?.data); // Calculate totals after data is fetched
        setData(response?.data);
      } else {
        message.error("Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceInfo();
  }, []);

  const print = () => {
    const printContent = document.getElementById("invoice-card").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const downloadPDF = () => {
    const element = document.getElementById("invoice-card");
    const options = {
      margin: 0.5,
      filename: `Invoice-${data?.[0]?.bookingNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().from(element).set(options).save();
  };

  if (loading) return <div>Loading...</div>;

  const calculateTotals = (bookings) => {
    const totalAdvance = bookings.reduce(
      (sum, booking) => sum + (booking?.advancePayment || 0),
      0
    );
    const totalDue = bookings.reduce(
      (sum, booking) => sum + (booking?.duePayment || 0),
      0
    );
    const totalBill = bookings.reduce(
      (sum, booking) => sum + (booking?.totalBill || 0),
      0
    );

    setTotals({
      totalAdvance,
      totalDue,
      totalBill,
    });
  };

  return (
    <Watermark content="Samudra Bari 2024">
      <div>
        <div className="mx-28">
          <div className="flex gap-8 w-full mt-8 mx-0">
            <Button
              type="primary"
              onClick={downloadPDF}
              className="p-mr-2"
              icon={<DownloadOutlined />}>
              Download PDF
            </Button>
            <Button
              type="primary"
              onClick={print}
              className="p-mb-3"
              icon={<PrinterOutlined />}>
              Print
            </Button>
          </div>
        </div>

        <div
          id="invoice-card"
          className="bg-white p-8 rounded-lg shadow-md border border-gray-300 w-full mt-4"
          style={{ fontSize: "12px" }} // Make the overall text smaller
        >
          <div className="p-8">
            <div className="text-center">
              <p className="text-3xl font-bold uppercase text-blue-700 underline">
                {data?.hotelName || "Samudra Bari"}
              </p>
              <p className="text-lg font-bold pt-2 text-red-700">
                Invoice Number: {data?.[0]?.bookingNo || "N/A"}
              </p>
              <p className="text-gray-600">
                Date:{" "}
                {moment(data?.createdAt).format("D MMM YYYY") ||
                  "02 October 2024"}
              </p>
            </div>

            <div className="mt-8 text-gray-800">
              <p className="font-bold text-md">Bill To:</p>
              <p>Guest Name: {data?.[0]?.fullName || "Ahmed Niloy"}</p>
              <p>Phone: {data?.[0]?.phone || "01625441918"}</p>
              <p>NID/Passport: {data?.[0]?.nidPassport || "3762373821"}</p>
              <p>
                Address: {data?.[0]?.address || "Jinjira, Keranigong, Dhaka"}
              </p>
            </div>

            {/* Table for Booking Details */}
            <div className="mt-8 text-gray-800">
              <p className="font-bold text-md">Booking Details:</p>
              <table
                className="table-auto w-full border-collapse border border-gray-400 mt-4 text-left text-xs" // Smaller text
                style={{ fontSize: "10px" }} // Reduce text size within the table further
              >
                <thead>
                  <tr className="bg-red-700 text-white">
                    <th className="border border-gray-400 px-2 py-1">Room</th>
                    <th className="border border-gray-400 px-2 py-1">
                      Check-in
                    </th>
                    <th className="border border-gray-400 px-2 py-1">
                      Check-out
                    </th>
                    <th className="border border-gray-400 px-2 py-1">Nights</th>
                    <th className="border border-gray-400 px-2 py-1">Adults</th>
                    <th className="border border-gray-400 px-2 py-1">
                      Children
                    </th>
                    <th className="border border-gray-400 px-2 py-1">
                      Advance
                    </th>
                    <th className="border border-gray-400 px-2 py-1">Due</th>
                    <th className="border border-gray-400 px-2 py-1">
                      Total Bill
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((booking, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 px-2 py-1">
                        {`${booking?.roomNumberName || "N/A"} (${
                          booking?.roomCategoryName || "N/A"
                        })`}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {moment(booking?.checkInDate).format("D MMM YYYY") ||
                          "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {moment(booking?.checkOutDate).format("D MMM YYYY") ||
                          "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.nights || "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.adults || "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.children || "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.advancePayment || "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.duePayment || "N/A"}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">
                        {booking?.totalBill || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-gray-800">
              <p className="font-bold text-md">Payment Information:</p>
              <p>
                Total Advance Payment: {data?.[0]?.advancePayment || "N/A"} taka
              </p>
              <p>Total Due Payment: {data?.[0]?.duePayment || "N/A"} taka</p>
              <p>Total Payment Method: {data?.[0]?.paymentMethod || "N/A"}</p>
            </div>
            <div className="mt-8 text-gray-800">
              <p className="font-bold text-md">Payment Information:</p>
              <p>Total Advance Payment: {totals.totalAdvance} taka</p>
              <p>Total Due Payment: {totals.totalDue} taka</p>
              <p>Total Bill: {totals.totalBill} taka</p>
            </div>

            <div className="mt-8 text-gray-800">
              <p className="font-bold text-md">Note:</p>
              <p>
                Thank you so much for choosing Samudra Bari. Hope you will enjoy
                your stay with us. Best of luck for your Cox’s Bazar trip.
              </p>
            </div>

            <div className="mt-8 text-gray-800">
              <p>
                Address: N.H.A building No- 09, Samudra Bari, Kolatoli, Cox’s
                Bazar
              </p>
              <p>Front Desk no: 01886628295</p>
              <p>Reservation no: 01886628296</p>
              <p>Booked by: {data?.[0]?.bookedBy || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </Watermark>
  );
};

export default Invoice;

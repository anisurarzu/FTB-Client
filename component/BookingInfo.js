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
  Select,
  Row,
  Col,
} from "antd";
import { useFormik } from "formik";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import coreAxios from "@/utils/axiosInstance";

const BookingInfo = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [roomNumbers, setRoomNumbers] = useState([]);

  const fetchRoomCategories = async () => {
    try {
      const response = await coreAxios.get("hotelCategory");
      setRoomCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };
  const fetchHotelInfo = async () => {
    try {
      const response = await coreAxios.get("hotel");
      setHotelInfo(response.data);
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };

  const fetchHotelCategories = async (value) => {
    // Filter the hotel data by hotelID
    const hotel = hotelInfo.find((hotel) => hotel.hotelID === value);

    console.log("---------", hotel);
    // Check if hotel is found and has roomCategories
    if (hotel && hotel.roomCategories) {
      // Set the roomCategories to the state
      setRoomCategories(hotel.roomCategories);
    } else {
      // Handle the case where the hotel is not found or no roomCategories exist
      console.log("Hotel not found or no room categories available.");
      setRoomCategories([]);
    }
  };

  const fetchRoomNumbers = async (value) => {
    const room = roomCategories.find((room) => room.id === value);

    console.log("---------2", room);
    // Check if hotel is found and has roomCategories
    if (room && room.roomNumbers) {
      // Set the roomCategories to the state
      setRoomNumbers(room.roomNumbers);
    } else {
      // Handle the case where the hotel is not found or no roomCategories exist
      console.log("Room not found or no room numbers available.");
      setRoomCategories([]);
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

  const formik = useFormik({
    initialValues: {
      fullName: "",
      nidPassport: "",
      address: "",
      phone: "",
      email: "",
      roomCategory: "",
      roomNumber: "",
      roomPrice: 0,
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      totalBill: 0,
      advancePayment: 0,
      duePayment: 0,
      paymentMethod: "",
      transactionId: "",
      note: "",
      bookedBy: "",
      reference: "",
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const newBooking = {
          ...values,
          key: uuidv4(),
        };

        if (isEditing) {
          const res = await axios.put(`/api/booking/${editingKey}`, newBooking);
          if (res.status === 200) {
            message.success("Booking updated successfully!");
            fetchBookings();
          }
        } else {
          const res = await axios.post("/api/booking", newBooking);
          if (res.status === 200) {
            message.success("Booking created successfully!");
            fetchBookings();
          }
        }

        resetForm();
        setVisible(false);
        setIsEditing(false);
        setEditingKey(null);
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
      const response = await axios.get("/api/bookings");
      if (response.status === 200) {
        setBookings(response.data);
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
    formik.setFieldValue("roomCategory", "");
    formik.setFieldValue("roomNumber", "");
    formik.setFieldValue("hotelName", value);
    fetchHotelCategories(value);
  };
  const handleRoomCategoryChange = (value) => {
    formik.setFieldValue("roomNumber", "");
    formik.setFieldValue("roomCategory", value);
    fetchRoomNumbers(value);
  };

  const handleEdit = (record) => {
    setEditingKey(record._id);
    formik.setValues(record);
    setVisible(true);
    setIsEditing(true);
  };

  const handleDelete = async (key) => {
    setLoading(true);
    try {
      const res = await axios.delete(`/api/booking/${key}`);
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

  const columns = [
    {
      title: "Guest Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Room Category",
      dataIndex: "roomCategory",
      key: "roomCategory",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Check In",
      dataIndex: "checkInDate",
      key: "checkInDate",
    },
    {
      title: "Check Out",
      dataIndex: "checkOutDate",
      key: "checkOutDate",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this booking?"
            onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

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

  

  return (
    <div className="">
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
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={bookings}
          pagination={false}
          rowKey="_id"
        />
      </Spin>

      <Modal
        title={isEditing ? "Edit Booking" : "Create Booking"}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}>
        <Form onFinish={formik.handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Full Name" className="mb-2">
                <Input
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={(e) => {
                    formik.handleChange(e);
                    fetchGuestInfo(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="NID/Passport" className="mb-2">
                <Input
                  name="nidPassport"
                  value={formik.values.nidPassport}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Address" className="mb-2">
                <Input
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" className="mb-2">
                <Input
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="E-mail" className="mb-2">
                <Input
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Hotel Name" className="mb-2">
                <Select
                  name="hotelName"
                  value={formik.values.hotelName}
                  onChange={handleHotelInfo}>
                  {hotelInfo.map((hotel) => (
                    <Select.Option key={hotel.hotelID} value={hotel.hotelID}>
                      {hotel.hotelName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Room Categories" className="mb-2">
                <Select
                  name="roomCategory"
                  value={formik.values.roomCategory}
                  onChange={handleRoomCategoryChange}>
                  {roomCategories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Room Number" className="mb-2">
                <Select
                  name="roomNumber"
                  value={formik.values.roomNumber}
                  onChange={(value) =>
                    formik.setFieldValue("roomNumber", value)
                  }>
                  {roomNumbers.map((room) => (
                    <Select.Option key={room.id} value={room.id}>
                      {room.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item label="Room Price" className="mb-2">
  <Input
    name="roomPrice"
    value={formik.values.roomPrice}
    onChange={handlePriceChange} // Call handlePriceChange on price change
  />
</Form.Item>

            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Check Out Date" className="mb-2">
                <DatePicker
                  name="checkOutDate"
                  value={formik.values.checkOutDate}
                  onChange={(date) =>
                    formik.setFieldValue("checkOutDate", date)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Check In Date" className="mb-2">
                <DatePicker
                  name="checkInDate"
                  value={formik.values.checkInDate}
                  onChange={(date) => formik.setFieldValue("checkInDate", date)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Number of Nights" className="mb-2">
                <Input
                  name="nights"
                  value={formik.values.nights}
                  onChange={(e) => {
                    formik.handleChange(e);
                    handleNightsChange(e);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Total Bill" className="mb-2">
                <Input
                  name="totalBill"
                  value={formik.values.totalBill}
                  disabled // Calculate this based on room price and nights
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
            <Form.Item label="Advance Payment" className="mb-2">
  <Input
    name="advancePayment"
    value={formik.values.advancePayment}
    onChange={handleAdvancePaymentChange} // Calculate duePayment when advance payment changes
  />
</Form.Item>

            </Col>
            <Col span={12}>
            <Form.Item label="Due Payment" className="mb-2">
  <Input
    name="duePayment"
    disabled
    value={formik.values.duePayment}
    readOnly // Make this field read-only since it's calculated automatically
  />
</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Payment Method" className="mb-2">
                <Select
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
            </Col>
          </Row>
          <Form.Item label="Transaction ID" className="mb-2">
            <Input
              name="transactionId"
              value={formik.values.transactionId}
              onChange={formik.handleChange}
            />
          </Form.Item>
          <Form.Item label="Note" className="mb-2">
            <Input
              name="note"
              value={formik.values.note}
              onChange={formik.handleChange}
            />
          </Form.Item>

          <Form.Item label="Reference" className="mb-2">
            <Input
              name="reference"
              value={formik.values.reference}
              onChange={formik.handleChange}
            />
          </Form.Item>
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
  );
};

export default BookingInfo;

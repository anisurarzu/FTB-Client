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

const BookingInfo = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [roomNumbers, setRoomNumbers] = useState([]);

  const fetchRoomCategories = async () => {
    try {
      const response = await axios.get("/api/room-categories");
      setRoomCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch room categories.");
    }
  };

  const fetchRoomNumbers = async (categoryId) => {
    try {
      const response = await axios.get(
        `/api/room-numbers?category=${categoryId}`
      );
      setRoomNumbers(response.data);
    } catch (error) {
      message.error("Failed to fetch room numbers.");
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
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      totalBill: "",
      advancePayment: "",
      duePayment: "",
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
    fetchBookings();
    fetchRoomCategories();
  }, []);

  const handleRoomCategoryChange = (value) => {
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
              <Form.Item label="Number of Nights" className="mb-2">
                <Input
                  name="nights"
                  value={formik.values.nights}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Total Bill" className="mb-2">
                <Input
                  name="totalBill"
                  value={formik.values.totalBill}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Advance Payment" className="mb-2">
                <Input
                  name="advancePayment"
                  value={formik.values.advancePayment}
                  onChange={formik.handleChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Due Payment" className="mb-2">
                <Input
                  name="duePayment"
                  value={formik.values.duePayment}
                  onChange={formik.handleChange}
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
          <Form.Item label="Booked By" className="mb-2">
            <Input
              name="bookedBy"
              value={formik.values.bookedBy}
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

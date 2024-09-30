"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  message,
  Spin,
  Form,
  Input,
  Select,
  Popconfirm,
  Menu,
  Dropdown,
} from "antd";
import { useFormik } from "formik";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import coreAxios from "@/utils/axiosInstance";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const hotelRoom = [
  { id: 1, number: "101" },
  { id: 2, number: "102" },
  { id: 3, number: "201" },
  { id: 4, number: "202" },
];

const HotelInformation = () => {
  const [visible, setVisible] = useState(false);
  const [miniModalVisible, setMiniModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hotelInfo, setHotelInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [hotelCategory, setHotelCategory] = useState([]);
  const [hotelRoom, setHotelRoom] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);

  // Fetch hotel information from API
  const fetchHotelCategoryInformation = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("hotelCategory");
      if (response?.status === 200) {
        setHotelCategory(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch category information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchHotelRoomInformation = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("hotelRoom");
      if (response?.status === 200) {
        setHotelRoom(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch room information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fetchHotelInformation = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("hotel");
      if (response?.status === 200) {
        setHotelInfo(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch hotel information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelCategoryInformation();
    fetchHotelRoomInformation();
    fetchHotelInformation();
  }, []);

  const formik = useFormik({
    initialValues: {
      hotelName: "",
      hotelDescription: "",
      roomCategories: [],
      roomNumbers: {}, // { categoryId: [{ id: number, number: string }] }
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const newHotelInfo = {
          hotelName: values.hotelName,
          hotelDescription: values.hotelDescription,
          roomCategories: values.roomCategories.map((categoryId) => {
            return {
              id: categoryId,
              name: hotelCategory.find((c) => c.id === categoryId).name,
              description: hotelCategory.find((c) => c.id === categoryId)
                .description,
              roomNumbers: values.roomNumbers[categoryId] || [],
            };
          }),
        };

        // Handle Update or Create
        if (isEditing) {
          await coreAxios.put(`/hotel/${editId}`, newHotelInfo);
          message.success("Hotel information updated successfully!");
        } else {
          const res = await coreAxios.post(`/hotel`, newHotelInfo);
          if (res?.status === 200) {
            message.success("Hotel information submitted successfully!");
          }
        }

        resetForm();
        setVisible(false);
        setIsEditing(false);
        fetchHotelInformation();
      } catch (error) {
        message.error("Failed to submit hotel information. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (hotel) => {
    setIsEditing(true);
    setVisible(true);
    setEditId(hotel._id);

    const roomNumbers = {};
    hotel.roomCategories.forEach((category) => {
      roomNumbers[category.id] = category.roomNumbers;
    });

    formik.setValues({
      hotelName: hotel.hotelName,
      hotelDescription: hotel.hotelDescription,
      roomCategories: hotel.roomCategories.map((category) => category.id),
      roomNumbers: roomNumbers,
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await coreAxios.delete(`/hotel/${id}`);
      message.success("Hotel deleted successfully!");
      fetchHotelInformation();
    } catch (error) {
      message.error("Failed to delete hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (selectedCategories) => {
    const updatedRoomNumbers = { ...formik.values.roomNumbers };
    selectedCategories.forEach((categoryId) => {
      if (!updatedRoomNumbers[categoryId]) {
        updatedRoomNumbers[categoryId] = [];
      }
    });
    formik.setFieldValue("roomCategories", selectedCategories);
    formik.setFieldValue("roomNumbers", updatedRoomNumbers);
  };

  const handleRoomNumberChange = (categoryId, selectedRoomNumbers) => {
    const updatedRoomNumbers = { ...formik.values.roomNumbers };

    // Set the room numbers directly for the category
    updatedRoomNumbers[categoryId] = hotelRoom
      .filter((room) => selectedRoomNumbers?.includes(room?.id))
      .map((room) => ({
        id: room.id,
        name: room.name,
      }));

    // Update the formik field value
    formik.setFieldValue("roomNumbers", updatedRoomNumbers);
  };

  const handleRoomCategoryClick = (category) => {
    setSelectedCategory(category);
    const rooms =
      hotelInfo
        .find((hotel) =>
          hotel.roomCategories.some((cat) => cat.id === category.id)
        )
        ?.roomCategories.find((cat) => cat.id === category.id)?.roomNumbers ||
      [];
    setSelectedRoomNumbers(rooms);
    setMiniModalVisible(true);
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
        Add New Hotel Information
      </Button>

      <Spin spinning={loading}>
        <Table
          columns={[
            {
              title: "Hotel Name",
              dataIndex: "hotelName",
              key: "hotelName",
            },
            {
              title: "Hotel Description",
              dataIndex: "hotelDescription",
              key: "hotelDescription",
            },
            {
              title: "Room Categories & Numbers",
              dataIndex: "roomCategories",
              key: "roomCategories",
              render: (categories) =>
                categories?.map((cat) => (
                  <div key={cat?.id}>
                    <Button
                      type="link"
                      onClick={() => handleRoomCategoryClick(cat)}>
                      {cat?.name}
                    </Button>
                  </div>
                )),
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => {
                const menu = (
                  <Menu>
                    <Menu.Item
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}>
                      Edit
                    </Menu.Item>
                    <Menu.Item key="delete" icon={<DeleteOutlined />}>
                      <Popconfirm
                        title="Are you sure you want to delete this hotel?"
                        onConfirm={() => handleDelete(record._id)}>
                        Delete
                      </Popconfirm>
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <Button>
                      Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                );
              },
            },
          ]}
          dataSource={hotelInfo}
          pagination={false}
          rowKey="_id"
          scroll={{ x: true }}
        />
      </Spin>

      {/* Modal for Hotel Info */}
      <Modal
        title={
          isEditing ? "Edit Hotel Information" : "Create Hotel Information"
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}>
        <Form onFinish={formik.handleSubmit} layout="vertical">
          <Form.Item label="Hotel Name">
            <Input
              name="hotelName"
              value={formik.values.hotelName}
              onChange={formik.handleChange}
            />
          </Form.Item>
          <Form.Item label="Hotel Description">
            <Input.TextArea
              name="hotelDescription"
              value={formik.values.hotelDescription}
              onChange={formik.handleChange}
              rows={4}
            />
          </Form.Item>
          <Form.Item label="Room Categories">
            <Select
              mode="multiple"
              placeholder="Select room categories"
              value={formik.values.roomCategories}
              onChange={handleCategoryChange}>
              {hotelCategory.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {formik.values.roomCategories.map((categoryId) => (
            <Form.Item
              key={categoryId}
              label={`Room Numbers for ${
                hotelCategory.find((cat) => cat.id === categoryId)?.name
              }`}>
              <Select
                mode="multiple"
                placeholder="Select room numbers"
                value={formik.values.roomNumbers[categoryId]?.map((r) => r.id)}
                onChange={(selectedRoomNumbers) =>
                  handleRoomNumberChange(categoryId, selectedRoomNumbers)
                }>
                {hotelRoom.map((room) => (
                  <Option key={room.id} value={room.id}>
                    {room.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ))}

          <Form.Item>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="bg-[#8ABF55] hover:bg-[#7DA54E] text-white">
              {isEditing ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Mini Modal for Room Details */}
      <Modal
        title={`Room Numbers for ${selectedCategory?.name}`}
        open={miniModalVisible}
        onCancel={() => setMiniModalVisible(false)}
        footer={null}>
        {selectedRoomNumbers.length > 0 ? (
          selectedRoomNumbers.map((room) => (
            <div key={room.id}>{room.name}</div>
          ))
        ) : (
          <div>No rooms available for this category.</div>
        )}
      </Modal>
    </div>
  );
};

export default HotelInformation;

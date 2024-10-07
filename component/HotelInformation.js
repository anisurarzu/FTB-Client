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
import coreAxios from "@/utils/axiosInstance";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

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

  // Fetch hotel category and room data
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

  // Formik for handling form data and submission
  const formik = useFormik({
    initialValues: {
      hotelName: "",
      hotelDescription: "",
      roomCategories: [],
      roomNumbers: {}, // { categoryId: [{ id: number, name: string }] }
    },
    onSubmit: async (values, { resetForm }) => {

      console.log('values----',values)
      try {
        setLoading(true);

        // Construct the new hotel info object
        const newHotelInfo = {
          hotelName: values.hotelName,
          hotelDescription: values.hotelDescription,
          roomCategories: values.roomCategories.map((categoryId) => {
            return {
              id: categoryId,
              name: hotelCategory.find((c) => c.name === categoryId).name,
              description: hotelCategory.find((c) => c.name === categoryId)
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

  // Handle Edit action
  const handleEdit = (hotel) => {
    setIsEditing(true);
    setVisible(true);
    setEditId(hotel._id);

    // Extract roomCategories and roomNumbers for pre-filling the form
    const roomNumbers = {};
    hotel.roomCategories.forEach((category) => {
      roomNumbers[category.name] = category.roomNumbers.map((room) => ({
        id: room.id,
        name: room.name,
      }));
    });

    // Pre-fill the form with hotel data
    formik.setValues({
      hotelName: hotel.hotelName,
      hotelDescription: hotel.hotelDescription,
      roomCategories: hotel.roomCategories.map((category) => category.name), // Extract category IDs
      roomNumbers: roomNumbers, // Pre-fill room numbers for each category
    });
  };

  // Handle Delete action
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

  // Handle Category Change for multi-select
  const handleCategoryChange = (selectedCategories) => {
    const updatedRoomNumbers = { ...formik.values.roomNumbers };

    // Ensure roomNumbers for each selected category is initialized to an empty array
    selectedCategories.forEach((categoryId) => {
      if (!updatedRoomNumbers[categoryId]) {
        updatedRoomNumbers[categoryId] = [];
      }
    });

    formik.setFieldValue("roomCategories", selectedCategories);
    formik.setFieldValue("roomNumbers", updatedRoomNumbers);
  };

  // Handle Room Number Change for specific category
  const handleRoomNumberChange = (categoryId, selectedRoomNumbers) => {
    const updatedRoomNumbers = { ...formik.values.roomNumbers };

    // Update selected room numbers for the category
    updatedRoomNumbers[categoryId] = hotelRoom
      .filter((room) => selectedRoomNumbers.includes(room.name)) // Filter rooms based on selected IDs
      .map((room) => ({
        id: room.id, // Store the room ID
        name: room.name, // Store the room name
      }));

    formik.setFieldValue("roomNumbers", updatedRoomNumbers);
  };

  // Handle room category click
  const handleRoomCategoryClick = (category) => {
    setSelectedCategory(category);
    const rooms =
      hotelInfo
        .find((hotel) =>
          hotel.roomCategories.some((cat) => cat.name === category.name)
        )
        ?.roomCategories.find((cat) => cat.name === category.name)?.roomNumbers ||
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
            <Input
              name="hotelDescription"
              value={formik.values.hotelDescription}
              onChange={formik.handleChange}
            />
          </Form.Item>

          <Form.Item label="Room Categories">
            <Select
              mode="multiple"
              value={formik.values.roomCategories}
              onChange={handleCategoryChange}
              placeholder="Select room categories">
              {hotelCategory.map((category) => (
                <Option key={category.name} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {formik.values.roomCategories.map((categoryId) => (
            <Form.Item key={categoryId} label={`Room Numbers for Category`}>
              <Select
                mode="multiple"
                value={formik.values.roomNumbers[categoryId]?.map(
                  (room) => room.name
                )} // Use room.id as value
                onChange={(selectedRoomNumbers) =>
                  handleRoomNumberChange(categoryId, selectedRoomNumbers)
                }
                placeholder="Select room numbers">
                {hotelRoom.map((room) => (
                  <Option key={room.name} value={room.name}>
                    {room.name} {/* Show room name here */}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ))}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#8ABF55] hover:bg-[#7DA54E] text-white">
              {isEditing ? "Update Hotel" : "Create Hotel"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for viewing Room Numbers */}
      <Modal
        title="Room Numbers"
        visible={miniModalVisible}
        onCancel={() => setMiniModalVisible(false)}
        footer={null}>
        <ul className="list-disc pl-4">
          {selectedRoomNumbers.map((room) => (
            <li key={room.name}>{room.name}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default HotelInformation;

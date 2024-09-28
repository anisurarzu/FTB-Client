"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  message,
  Popconfirm,
  Spin,
  Pagination,
  Form,
  Input,
  Dropdown,
  Menu,
} from "antd";
import { EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { useFormik } from "formik";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import coreAxios from "@/utils/axiosInstance";

const HotelCategory = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [sliders, setSliders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve the token from localStorage

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await coreAxios.get("hotelCategory");
      if (response?.status === 200) {
        setLoading(false);
        setSliders(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      categoryName: "",
      categoryDescription: "",
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const newCategory = {
          key: uuidv4(),
          categoryName: values.categoryName,
          categoryDescription: values.categoryDescription,
        };

        if (isEditing) {
          const res = await coreAxios.put(
            `hotelCategory/${editingKey}`,
            newCategory
          );
          if (res?.status === 200) {
            setLoading(false);
            message.success("Category updated successfully!");
            fetchCategories();
          }
        } else {
          const res = await coreAxios.post("hotelCategory", newCategory);
          if (res?.status === 200) {
            setLoading(false);

            fetchCategories();
          }
        }

        resetForm();
        setVisible(false);
        setIsEditing(false);
        setEditingKey(null);
      } catch (error) {
        consol.log(error);
        message.error("Failed to add/update category. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (record) => {
    setEditingKey(record._id);
    formik.setValues({
      categoryName: record.categoryName,
      categoryDescription: record.categoryDescription,
    });
    setVisible(true);
    setIsEditing(true);
  };

  const handleDelete = async (key) => {
    setLoading(true);
    try {
      const res = await coreAxios.delete(`hotelCategory/${key}`);
      if (res?.status === 200) {
        setLoading(false);
        message.success("Category deleted successfully!");
        fetchCategories();
      }
    } catch (error) {
      console.log("---", error);
      message.error("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Category Description",
      dataIndex: "categoryDescription",
      key: "categoryDescription",
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
                title="Are you sure you want to delete this category?"
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
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
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
        Add New Category
      </Button>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={sliders}
          pagination={false}
          rowKey="key"
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={sliders?.length}
          onChange={(page) => setPagination({ ...pagination, current: page })}
          className="mt-4"
        />
      </Spin>

      <Modal
        title={isEditing ? "Edit Category" : "Create Category"}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}>
        <Form onFinish={formik.handleSubmit} layout="vertical">
          <Form.Item label="Category Name">
            <Input
              name="categoryName"
              value={formik.values.categoryName}
              onChange={formik.handleChange}
            />
          </Form.Item>
          <Form.Item label="Category Description">
            <Input.TextArea
              name="categoryDescription"
              value={formik.values.categoryDescription}
              onChange={formik.handleChange}
              rows={4}
            />
          </Form.Item>
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
    </div>
  );
};

export default HotelCategory;

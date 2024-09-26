"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Upload,
  Table,
  Select,
  message,
  Input,
  Radio,
} from "antd"; // Import Radio from Ant Design
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useFormik } from "formik";
import Image from "next/image";
import axios from "axios";

const roleInfo = [
  { id: 1, value: "agent", label: "Agent" },
  { id: 2, value: "superadmin", label: "Super Admin" },
  { id: 3, value: "admin", label: "Admin" },
  { id: 4, value: "owner", label: "Owner" },
  { id: 5, value: "systemadmin", label: "System Admin" },
  { id: 6, value: "user", label: "User" },
];

const AgentInformation = () => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const formik = useFormik({
    initialValues: {
      profilePicture: null, // Set as file
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      nid: "",
      currentAddress: "",
      role: "",
      gender: "", // Add gender to initial values
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        // Upload the image to imgbb
        const formData = new FormData();
        formData.append("image", values.profilePicture);

        const imgRes = await axios.post(
          `https://api.imgbb.com/1/upload?key=0d928e97225b72fcd198fa40d99a15d5`,
          formData
        );

        const imageUrl = imgRes.data.data.url;

        const newUser = {
          key: uuidv4(),
          profilePicture: imageUrl, // Use imgbb image URL
          username: values.username,
          email: values.email,
          phoneNumber: values.phoneNumber,
          nid: values.nid,
          password: values?.password,
          plainPassword: values?.password,
          currentAddress: values.currentAddress,
          gender: values.gender, // Include gender in newUser
          role: roleInfo.find((role) => role.value === values.role),
        };

        if (isEditing) {
          await axios.put(
            `https://your-server-endpoint.com/api/users/${editingKey}`,
            newUser
          );
          setUsers((prev) =>
            prev.map((user) => (user.key === editingKey ? newUser : user))
          );
          message.success("User updated successfully!");
        } else {
          await axios.post("http://localhost:8000/api/auth/register", newUser, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          setUsers((prev) => [...prev, newUser]);
          message.success("User added successfully!");
        }

        resetForm();
        setVisible(false);
        setIsEditing(false);
        setEditingKey(null);
      } catch (error) {
        message.error("Failed to add/update user. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (record) => {
    setEditingKey(record.key);
    formik.setValues({
      profilePicture: record.profilePicture,
      username: record.username,
      email: record.email,
      phoneNumber: record.phoneNumber,
      nid: record.nid,
      currentAddress: record.currentAddress,
      role: record.role.value,
      gender: record.gender, // Set gender for editing
    });
    setVisible(true);
    setIsEditing(true);
  };

  const handleDelete = (key) => {
    setUsers(users.filter((user) => user.key !== key));
    message.success("User deleted successfully!");
  };

  const columns = [
    {
      title: "Profile Picture",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (text) => (
        <Image src={text} alt="Profile" width={100} height={60} />
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "NID",
      dataIndex: "nid",
      key: "nid",
    },
    {
      title: "Current Address",
      dataIndex: "currentAddress",
      key: "currentAddress",
    },
    {
      title: "Gender", // New column for Gender
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Role",
      dataIndex: ["role", "label"],
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-500"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            className="text-red-500"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Button
        type="primary"
        onClick={() => {
          setIsEditing(false);
          formik.resetForm();
          setVisible(true);
        }}
        className="mb-4 bg-[#8ABF55] hover:bg-[#7DA54E] text-white">
        Add New User
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
        scroll={{ x: "max-content" }}
      />
      <Modal
        title={isEditing ? "Edit User" : "Create User"}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        className="p-6">
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label className="pr-2">Profile Picture</label>
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={(file) => {
                formik.setFieldValue("profilePicture", file);
                return false;
              }}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            {formik.errors.profilePicture && (
              <div className="text-red-500">{formik.errors.profilePicture}</div>
            )}
          </div>

          <div>
            <label>Username</label>
            <Input
              name="username"
              onChange={formik.handleChange}
              value={formik.values.username}
            />
            {formik.errors.username && (
              <div className="text-red-500">{formik.errors.username}</div>
            )}
          </div>
          <div>
            <label>Password</label>
            <Input
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            {formik.errors.password && (
              <div className="text-red-500">{formik.errors.password}</div>
            )}
          </div>

          <div>
            <label>Email</label>
            <Input
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.errors.email && (
              <div className="text-red-500">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label>Phone Number</label>
            <Input
              name="phoneNumber"
              onChange={formik.handleChange}
              value={formik.values.phoneNumber}
            />
            {formik.errors.phoneNumber && (
              <div className="text-red-500">{formik.errors.phoneNumber}</div>
            )}
          </div>

          <div>
            <label>NID</label>
            <Input
              name="nid"
              onChange={formik.handleChange}
              value={formik.values.nid}
            />
            {formik.errors.nid && (
              <div className="text-red-500">{formik.errors.nid}</div>
            )}
          </div>

          <div>
            <label>Current Address</label>
            <Input
              name="currentAddress"
              onChange={formik.handleChange}
              value={formik.values.currentAddress}
            />
            {formik.errors.currentAddress && (
              <div className="text-red-500">{formik.errors.currentAddress}</div>
            )}
          </div>

          <div>
            <label>Gender</label>
            <Radio.Group
              name="gender"
              onChange={formik.handleChange}
              value={formik.values.gender}
              className="flex space-x-4">
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
            {formik.errors.gender && (
              <div className="text-red-500">{formik.errors.gender}</div>
            )}
          </div>

          <div>
            <label>Role</label>
            <Select
              style={{ width: "100%" }}
              name="role"
              onChange={(value) => formik.setFieldValue("role", value)}
              value={formik.values.role}
              options={roleInfo.map((role) => ({
                value: role.value,
                label: role.label,
              }))}
            />
            {formik.errors.role && (
              <div className="text-red-500">{formik.errors.role}</div>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="mt-4 bg-[#8ABF55] hover:bg-[#7DA54E] text-white">
            Submit
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AgentInformation;

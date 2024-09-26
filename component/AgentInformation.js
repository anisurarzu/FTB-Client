"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Upload,
  Table,
  Select,
  message,
  Input,
  Radio,
  Image,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useFormik } from "formik";
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
  const token = localStorage.getItem("token");
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.log("----", error);
      message.error("Failed to fetch portfolios. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      profilePicture: null,
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      nid: "",
      currentAddress: "",
      role: "",
      gender: "",
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const imageUrl = await handleImageUpload(values?.profilePicture);

        const newUser = {
          key: uuidv4(),
          image: imageUrl,
          username: values.username,
          email: values.email,
          phoneNumber: values.phoneNumber,
          nid: values.nid,
          password: values?.password,
          plainPassword: values?.password,
          currentAddress: values.currentAddress,
          gender: values.gender,
          role: roleInfo.find((role) => role.value === values.role),
        };

        if (isEditing) {
          await axios.put(
            `https://your-server-endpoint.com/api/users/${editingKey}`,
            newUser
          );

          message.success("User updated successfully!");
        } else {
          await axios.post("http://localhost:8000/api/auth/register", newUser, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          message.success("User added successfully!");
        }
        resetForm();
        setVisible(false);
        setIsEditing(false);
        setEditingKey(null);
        fetchUsers();
      } catch (error) {
        message.error("Failed to add/update user. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageUpload = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=0d928e97225b72fcd198fa40d99a15d5`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      message.error("Image upload failed. Please try again.");
      return null;
    }
  };

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
      gender: record.gender,
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
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image
          src={image}
          alt="Profile"
          width={40} // Reduced width for smaller design
          height={40} // Reduced height for smaller design
          style={{ borderRadius: "50%" }} // Make image rounded
        />
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: "15%", // Adjust width for compact design
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "20%", // Adjust width for compact design
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "15%", // Adjust width for compact design
    },
    {
      title: "NID",
      dataIndex: "nid",
      key: "nid",
      width: "15%", // Adjust width for compact design
    },
    {
      title: "Current Address",
      dataIndex: "currentAddress",
      key: "currentAddress",
      width: "20%", // Adjust width for compact design
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: "10%", // Adjust width for compact design
    },
    {
      title: "Role",
      dataIndex: ["role", "label"],
      key: "role",
      width: "10%", // Adjust width for compact design
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
        dataSource={users?.users}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
        scroll={{ x: "max-content" }}
        size="small" // Set table size to small
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
            <label>Role</label>
            <Select
              name="role"
              onChange={formik.handleChange}
              value={formik.values.role}
              options={roleInfo.map((role) => ({
                label: role.label,
                value: role.value,
              }))}
            />
          </div>

          <div>
            <label>Gender</label>
            <Radio.Group
              name="gender"
              onChange={formik.handleChange}
              value={formik.values.gender}>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
            {formik.errors.gender && (
              <div className="text-red-500">{formik.errors.gender}</div>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-[#8ABF55] hover:bg-[#7DA54E] text-white mt-4">
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AgentInformation;

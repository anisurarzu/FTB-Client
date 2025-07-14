"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Input,
  Button,
  Alert,
  Modal,
  Card,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Image from "next/image";
import coreAxios from "@/utils/axiosInstance";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

const Login = () => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [hotelModalVisible, setHotelModalVisible] = useState(false);
  const [hotelList, setHotelList] = useState([]);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    publicIP: "",
    privateIP: "",
  });

  const validationSchema = Yup.object({
    loginID: Yup.string().required("User ID is required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        () => {
          setLocation((prev) => ({
            ...prev,
            latitude: "0.0",
            longitude: "0.0",
          }));
        }
      );
    }

    const fetchPublicIP = async () => {
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        setLocation((prev) => ({ ...prev, publicIP: data.ip }));
      } catch (error) {
        console.error("Error fetching public IP:", error);
      }
    };

    const getPrivateIP = async () => {
      try {
        const peerConnection = new RTCPeerConnection({ iceServers: [] });
        peerConnection.createDataChannel("");
        peerConnection
          .createOffer()
          .then((offer) => peerConnection.setLocalDescription(offer));
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const ipMatch = event.candidate.candidate.match(
              /(?:\d{1,3}\.){3}\d{1,3}/
            );
            if (ipMatch) {
              setLocation((prev) => ({ ...prev, privateIP: ipMatch[0] }));
            }
          }
        };
      } catch (error) {
        console.error("Error getting private IP:", error);
      }
    };

    fetchPublicIP();
    getPrivateIP();
  }, []);

  const fetchHotelInfoByIDs = async (hotelIDs) => {
    try {
      const response = await coreAxios.get("hotel");
      const allHotels = response.data || [];
      const filtered = allHotels.filter((hotel) =>
        hotelIDs.some((h) => h.hotelID === hotel.hotelID)
      );
      setHotelList(filtered);
    } catch (error) {
      message.error("Failed to load hotel data.");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setButtonLoading(true);
    setLoginError("");

    const loginData = {
      loginID: values?.loginID,
      password: values?.password,
      latitude: location.latitude,
      longitude: location.longitude,
      publicIP: location.publicIP,
      privateIP: location.privateIP,
      loginTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      const response = await coreAxios.post(`auth/login`, loginData);

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));

        const userHotels = response.data.user.hotelID || [];
        await fetchHotelInfoByIDs(userHotels);
        setHotelModalVisible(true);
        document.body.classList.add("modal-blur-bg");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.error ||
          "An error occurred during login. Please try again."
      );
    } finally {
      setSubmitting(false);
      setButtonLoading(false);
    }
  };

  const handleHotelSelect = (hotelID) => {
    setHotelModalVisible(false);
    document.body.classList.remove("modal-blur-bg");
    router.push(`/dashboard?hotelID=${hotelID}`);
  };

  const handleModalClose = () => {
    localStorage.clear();
    setHotelModalVisible(false);
    document.body.classList.remove("modal-blur-bg");
    router.push("/login");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8ABF55] to-[#d2e9bd] p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Image
                src="/images/new-logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
              <Title level={3} className="!text-[#305a1d] !font-medium !mb-0">
                Fast Track Booking
              </Title>
              <Text type="secondary" className="text-sm">
                Welcome back! Please login to your account.
              </Text>
            </div>

            {loginError && (
              <Alert
                message={loginError}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            <Formik
              initialValues={{ loginID: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <Field
                      name="loginID"
                      as={Input}
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="User ID"
                      size="large"
                    />
                    <ErrorMessage
                      name="loginID"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      name="password"
                      as={Input.Password}
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Password"
                      size="large"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={buttonLoading}
                    className="w-full bg-[#8ABF55] hover:bg-[#74a044] border-none text-white font-medium rounded-lg"
                  >
                    Login
                  </Button>
                </Form>
              )}
            </Formik>
          </div>

          <div className="bg-[#f1f5f0] text-center py-3 text-xs text-gray-500">
            Developed by Anisur Rahman & Zihadi | Contact: 01840452081
          </div>
        </div>
      </div>

      {/* Hotel Selection Modal */}
      <Modal
        open={hotelModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        width="90%"
        style={{ maxWidth: "800px" }}
        className="hotel-selection-modal"
        closable={false}
        bodyStyle={{
          backgroundColor: "#8ABF55",
          borderRadius: "12px",
          padding: "16px",
          border: "2px solid white",
          boxShadow: "0 0 0 3px rgba(255,255,255,0.5)",
          display: "flex",
          flexDirection: "column",
          minHeight: "300px",
        }}
      >
        <Title
          level={4}
          className="!text-white !text-center !mb-4"
          style={{
            fontFamily:
              "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 500,
            fontSize: "1.25rem",
          }}
        >
          SELECT YOUR HOTEL
        </Title>

        <div style={{ flex: 1 }}>
          <Row gutter={[12, 12]} justify="center">
            {hotelList.length > 0 ? (
              hotelList.map((hotel) => (
                <Col key={hotel._id} xs={12} sm={8} md={6} lg={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="hotel-card"
                      onClick={() => handleHotelSelect(hotel.hotelID)}
                    >
                      <img
                        src={hotel.logo}
                        alt={hotel.hotelName}
                        className="hotel-logo"
                      />
                    </div>
                  </motion.div>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div className="text-white text-center py-4">
                  No hotels assigned to your account. Please contact
                  administrator.
                </div>
              </Col>
            )}
          </Row>
        </div>

        <div className="text-center mt-4">
          <Button onClick={handleModalClose} className="logout-btn">
            LOGOUT
          </Button>
        </div>
      </Modal>

      <style jsx global>{`
        body.modal-blur-bg::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .hotel-selection-modal .ant-modal-content {
          background-color: transparent;
          box-shadow: none;
        }

        .hotel-card {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          margin: 0 auto;
          overflow: hidden;
          border: 2px solid white;
          padding: 2px;
        }

        .hotel-card:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .hotel-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0 24px;
          height: 40px;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          border-color: white;
        }

        .ant-typography {
          font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>
    </>
  );
};

export default Login;

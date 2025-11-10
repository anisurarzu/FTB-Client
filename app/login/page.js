"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Modal, Row, Col, message, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
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
  const [lang, setLang] = useState("bn");
  const [showPassword, setShowPassword] = useState(false);

  const translations = {
    bn: {
      title: "ফাস্ট ট্র্যাক বুকিংয়ে স্বাগতম",
      subtitle: "আপনার সম্পূর্ণ বুকিং ম্যানেজমেন্ট সমাধান",
      userID: "ইউজার আইডি",
      password: "পাসওয়ার্ড",
      login: "লগইন করুন",
      loginIDPlaceholder: "FTB-1234",
      passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
      helpText: "আপনার ইউজার আইডি এবং পাসওয়ার্ড ব্যবহার করুন",
      required: "এই ফিল্ডটি প্রয়োজনীয়",
      loggingIn: "লগইন হচ্ছে...",
      signingIn: "Signing in..",
      selectHotel: "হোটেল নির্বাচন করুন",
      noHotels:
        "আপনার অ্যাকাউন্টে কোনো হোটেল নেই। অ্যাডমিনিস্ট্রেটর সাথে যোগাযোগ করুন।",
      logout: "লগআউট",
    },
    en: {
      title: "Welcome to Fast Track Booking",
      subtitle: "Your Complete Booking Management Solution",
      userID: "User ID",
      password: "Password",
      login: "Sign In",
      loginIDPlaceholder: "Enter your user ID",
      passwordPlaceholder: "Enter your password",
      helpText: "Use your user ID and password to login",
      required: "This field is required",
      loggingIn: "Logging in...",
      signingIn: "Signing in...",
      selectHotel: "SELECT YOUR HOTEL",
      noHotels:
        "No hotels assigned to your account. Please contact administrator.",
      logout: "LOGOUT",
    },
  };

  const t = translations[lang];

  const validationSchema = Yup.object({
    loginID: Yup.string().required(t.required),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required(t.required),
  });

  const fetchPublicIP = useCallback(async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      setLocation((prev) => ({ ...prev, publicIP: data.ip }));
    } catch (error) {
      console.error("Error fetching public IP:", error);
    }
  }, []);

  const getPrivateIP = useCallback(async () => {
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
  }, []);

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

    fetchPublicIP();
    getPrivateIP();
  }, [fetchPublicIP, getPrivateIP]);

  const fetchHotelInfoByIDs = useCallback(async (hotelIDs) => {
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
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left Section - Branding */}
          <div className="hidden md:flex flex-col items-center justify-center p-8 space-y-6 slide-in-left">
            <div className="animate-float">
              <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300 border border-gray-200">
                <Image
                  src="/images/new-logo.png"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain rounded-lg"
                  priority
                />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
                Fast Track Booking
              </h1>
              <p className="text-xl text-gray-600 font-medium">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: "📅",
                  label:
                    lang === "bn" ? "বুকিং ম্যানেজমেন্ট" : "Booking Management",
                },
                {
                  icon: "⚡",
                  label: lang === "bn" ? "দ্রুত বুকিং" : "Fast Booking",
                },
                {
                  icon: "🏨",
                  label:
                    lang === "bn" ? "হোটেল ব্যবস্থাপনা" : "Hotel Management",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm text-gray-700 font-medium">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="slide-in-right">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100">
              {/* Language Toggle */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors text-blue-700 font-medium"
                >
                  <GlobalOutlined />
                  <span>{lang === "bn" ? "EN" : "BN"}</span>
                </button>
              </div>

              {/* Logo for Mobile */}
              <div className="md:hidden flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-200">
                  <Image
                    src="/images/new-logo.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain rounded-lg"
                    priority
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {t.login}
                </h2>
                <p className="text-gray-500">{t.helpText}</p>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{loginError}</p>
                  </div>
                  <button
                    onClick={() => setLoginError("")}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Form */}
              <Formik
                initialValues={{ loginID: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, handleChange, handleBlur, setFieldTouched }) => (
                  <Form className="space-y-6">
                    {/* User ID Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.userID}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                          <UserOutlined className="text-lg" />
                        </div>
                        <Field
                          name="loginID"
                          as="input"
                          type="text"
                          placeholder={t.loginIDPlaceholder}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 font-medium"
                          onChange={(e) => {
                            handleChange(e);
                            setLoginError("");
                          }}
                          onBlur={() => setFieldTouched("loginID", true)}
                        />
                      </div>
                      <ErrorMessage
                        name="loginID"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.password}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                          <LockOutlined className="text-lg" />
                        </div>
                        <Field
                          name="password"
                          as="input"
                          type={showPassword ? "text" : "password"}
                          placeholder={t.passwordPlaceholder}
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 font-medium"
                          onChange={(e) => {
                            handleChange(e);
                            setLoginError("");
                          }}
                          onBlur={() => setFieldTouched("password", true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeInvisibleOutlined className="text-lg" />
                          ) : (
                            <EyeOutlined className="text-lg" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={buttonLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {buttonLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>
                            {lang === "bn" ? t.loggingIn : t.signingIn}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg">{t.login}</span>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm">
                  Developed by Anisur Rahman & Zihadi | Contact: 01840452081
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  © 2025 DMF Soft. All rights reserved.
                </p>
              </div>
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
            backgroundColor: "#3B82F6",
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
            {t.selectHotel}
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
                        <Image
                          src={hotel.logo}
                          alt={hotel.hotelName}
                          width={80}
                          height={80}
                          className="hotel-logo"
                        />
                      </div>
                    </motion.div>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div className="text-white text-center py-4">
                    {t.noHotels}
                  </div>
                </Col>
              )}
            </Row>
          </div>

          <div className="text-center mt-4">
            <Button onClick={handleModalClose} className="logout-btn">
              {t.logout}
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

          @keyframes blob {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .slide-in-left {
            animation: slideInLeft 0.6s ease-out;
          }
          .slide-in-right {
            animation: slideInRight 0.6s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default Login;

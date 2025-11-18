"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Modal, Row, Col, message, Typography } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import coreAxios from "@/utils/axiosInstance";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

// Icon components using Unicode characters
const UserIcon = () => <span style={{ fontSize: '20px' }}>👤</span>;
const LockIcon = () => <span style={{ fontSize: '20px' }}>🔒</span>;
const GlobeIcon = () => <span style={{ fontSize: '18px' }}>🌐</span>;
const EyeIcon = () => <span style={{ fontSize: '18px' }}>👁️</span>;
const EyeSlashIcon = () => <span style={{ fontSize: '18px' }}>🙈</span>;
const ChevronRightIcon = () => <span style={{ fontSize: '16px' }}>→</span>;

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
  const [lang, setLang] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({ loginID: false, password: false });

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
      rememberMe: "আমাকে মনে রাখুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      feature1: "স্বয়ংক্রিয় বুকিং ব্যবস্থাপনা",
      feature2: "রিয়েল-টাইম উপলব্ধতা",
      feature1Desc: "আপনার সমস্ত বুকিং একটি প্ল্যাটফর্মে পরিচালনা করুন",
      feature2Desc: "যেকোনো জায়গা থেকে, যেকোনো ডিভাইসে অ্যাক্সেস করুন",
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
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      feature1: "Automated Booking Management",
      feature2: "Real-time Availability",
      feature1Desc: "Manage all your bookings in one platform",
      feature2Desc: "Access anywhere, anytime, any device",
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

  const handleBlur = (field) => {
    setFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleFocus = (field) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-sky-900 to-cyan-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Top Navigation */}
        <div className="relative z-10 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-sky-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight">Fast Track Booking</h1>
              <p className="text-blue-300 text-xs">Enterprise Management</p>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all text-white border border-white/20 text-sm"
          >
            <GlobeIcon />
            <span className="font-semibold">{lang === "bn" ? "EN" : "বাংলা"}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-0">
            {/* Left Side - Login Form */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl lg:rounded-r-none shadow-2xl p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-3xl">F</span>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-slate-900 mb-3">{lang === "bn" ? "স্বাগতম" : "Welcome back"}</h2>
                  <p className="text-slate-600 text-lg">{t.helpText}</p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium">{loginError}</span>
                    <button onClick={() => setLoginError("")} className="text-red-500 hover:text-red-700">✕</button>
                  </div>
                )}

                {/* Login Form */}
                <Formik
                  initialValues={{ loginID: "", password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, handleChange, setFieldTouched }) => (
                    <Form className="space-y-6">
                      {/* User ID Field */}
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          {t.userID}
                        </label>
                        <div className={`relative flex items-center transition-all duration-300 ${
                          focused.loginID ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}>
                          <div className="absolute left-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                            <UserIcon />
                          </div>
                          <Field
                            name="loginID"
                            as="input"
                            type="text"
                            placeholder={t.loginIDPlaceholder}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300"
                            onChange={(e) => {
                              handleChange(e);
                              setLoginError("");
                            }}
                            onFocus={() => handleFocus("loginID")}
                            onBlur={() => {
                              setFieldTouched("loginID", true);
                              handleBlur("loginID");
                            }}
                          />
                        </div>
                        <ErrorMessage
                          name="loginID"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Password Field */}
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          {t.password}
                        </label>
                        <div className={`relative flex items-center transition-all duration-300 ${
                          focused.password ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}>
                          <div className="absolute left-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                            <LockIcon />
                          </div>
                          <Field
                            name="password"
                            as="input"
                            type={showPassword ? "text" : "password"}
                            placeholder={t.passwordPlaceholder}
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300"
                            onChange={(e) => {
                              handleChange(e);
                              setLoginError("");
                            }}
                            onFocus={() => handleFocus("password")}
                            onBlur={() => {
                              setFieldTouched("password", true);
                              handleBlur("password");
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Remember & Forgot */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900">{t.rememberMe}</span>
                        </label>
                        <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          {t.forgotPassword}
                        </a>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={buttonLoading}
                        className="group relative w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <span className="flex items-center justify-center">
                          {buttonLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {lang === "bn" ? t.loggingIn : t.signingIn}
                            </>
                          ) : (
                            <>
                              {t.login}
                              <ChevronRightIcon />
                            </>
                          )}
                        </span>
                      </button>
                    </Form>
                  )}
                </Formik>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
                  <p>Developed by Anisur Rahman & Zihadi | Contact: 01840452081</p>
                  <p className="mt-1">© 2025 DMF Soft. All rights reserved.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-600 rounded-3xl rounded-l-none p-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
              
              {/* Logo */}
              <div className="relative z-10 w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform hover:scale-110 transition-transform duration-300">
                <span className="text-blue-600 text-5xl font-bold">F</span>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-white text-5xl font-bold mb-4 tracking-tight">
                  Fast Track Booking
                </h3>
                <p className="text-blue-100 text-xl mb-12 max-w-md leading-relaxed">
                  {t.subtitle}
                </p>

                {/* Features */}
                <div className="space-y-4 text-left max-w-md mx-auto">
                  {[
                    { title: t.feature1, desc: t.feature1Desc },
                    { title: t.feature2, desc: t.feature2Desc },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all duration-300">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mt-2"></div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                        <p className="text-blue-100 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Company */}
                <div className="mt-12 text-blue-200 text-sm font-semibold tracking-wider">
                  DMF SOFT
                </div>
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
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
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
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </>
  );
};

export default Login;
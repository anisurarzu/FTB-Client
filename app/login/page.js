"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button, Alert } from "antd";
import { useRouter } from "next/navigation";
import coreAxios from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const Login = () => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loginError, setLoginError] = useState(""); // State to hold error messages
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
    // ✅ Geolocation Handling for Desktop & Mobile
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.warn("Geolocation permission denied. Using default values.");
          setLocation((prev) => ({
            ...prev,
            latitude: "0.0",
            longitude: "0.0",
          }));
        }
      );
    }

    // ✅ Get Public IP
    const fetchPublicIP = async () => {
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        setLocation((prev) => ({ ...prev, publicIP: data.ip }));
      } catch (error) {
        console.error("Error fetching public IP:", error);
      }
    };
    fetchPublicIP();

    // ✅ Get Private IP (Using WebRTC)
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
    getPrivateIP();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setButtonLoading(true);
    setLoginError(""); // Reset error message before submitting

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
        router.push("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setLoginError(error.response.data.error); // Show error message from backend
      } else {
        setLoginError(
          "An error occurred during login. Please try again later."
        );
      }
    } finally {
      setSubmitting(false);
      setButtonLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Section with Gradient and Branding */}
      <div className="relative flex w-full md:w-1/2 bg-gradient-to-br from-green-400 to-blue-500 items-center justify-center p-6 md:p-0">
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        <div className="z-10 text-center text-white px-4 md:px-10 space-y-3 md:space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome to Fast Track
          </h1>
          <h3 className="text-xl md:text-2xl font-semibold">Booking System</h3>
          <p className="text-base md:text-lg font-light">
            Efficient, Reliable, and Fast Booking Management System for your
            convenience.
          </p>
        </div>
        <div className="absolute bottom-5 left-5 text-white z-10 hidden md:block">
          <p className="font-semibold">Developed by:</p>
          <p>Anisur Rahman & Zihadi</p>
          <p>Contact: 01840452081</p>
        </div>
      </div>

      {/* Right Section - Login Form with Gradient Border */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 py-12 px-8 md:px-16">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg relative">
          <div className="absolute inset-0 border-2 border-transparent rounded-lg bg-clip-border bg-gradient-to-br from-green-400 to-blue-500 p-1 z-[-1]"></div>
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
              Login
            </h2>

            {/* Display error message if there's a login error */}
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
              onSubmit={handleSubmit}>
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="loginID"
                      className="block text-gray-700 font-medium mb-2">
                      User ID
                    </label>
                    <Field
                      name="loginID"
                      type="text"
                      as={Input}
                      prefix={<UserOutlined />}
                      placeholder="Enter your User ID"
                      className="p-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent w-full"
                      size="large"
                    />
                    <ErrorMessage
                      name="loginID"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-2">
                      Password
                    </label>
                    <Field
                      name="password"
                      type="password"
                      as={Input.Password}
                      prefix={<LockOutlined />}
                      placeholder="Enter your password"
                      className="p-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent w-full"
                      size="large"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={buttonLoading}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 border-none text-white text-lg rounded-lg">
                    Login
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

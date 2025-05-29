"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button, Alert } from "antd";
import { useRouter } from "next/navigation";
import coreAxios from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
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
    fetchPublicIP();

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
        router.push("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setLoginError(error.response.data.error);
      } else {
        setLoginError("An error occurred during login. Please try again.");
      }
    } finally {
      setSubmitting(false);
      setButtonLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8ABF55] to-[#d2e9bd] p-4">
      {/* <div className="absolute top-4 w-full text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-white shadow">
          📢 Want to join this system? Please login first.
        </h2>
      </div> */}

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-10">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Image
              src="/images/new-logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="rounded-full"
            />
            <h1 className="text-4xl font-bold text-[#305a1d]">
              Fast Track Booking
            </h1>
            <p className="text-gray-500 text-sm text-center">
              Welcome back! Please login to your account.
            </p>
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
            onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <Field
                    name="loginID"
                    as={Input}
                    prefix={<UserOutlined />}
                    placeholder="User ID"
                    size="large"
                  />
                  <ErrorMessage
                    name="loginID"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="password"
                    as={Input.Password}
                    prefix={<LockOutlined />}
                    placeholder="Password"
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
                  size="large"
                  loading={buttonLoading}
                  className="w-full bg-[#8ABF55] hover:bg-[#74a044] border-none text-white font-semibold rounded-md">
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="bg-[#f1f5f0] text-center py-4 text-xs text-gray-500">
          Developed by Anisur Rahman & Zihadi | Contact: 01840452081
        </div>
      </div>
    </div>
  );
};

export default Login;

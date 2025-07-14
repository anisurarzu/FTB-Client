import { Button, Result, Space } from "antd";
import { motion } from "framer-motion";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const NoPermissionBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        maxWidth: "100%",
        width: "100%",
        padding: "16px",
      }}
    >
      <motion.div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
        whileHover={{ y: -2 }}
      >
        <Space direction="vertical" size="middle">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              transition: {
                repeat: Infinity,
                duration: 2,
              },
            }}
          >
            <LockOutlined
              style={{
                fontSize: "32px",
                color: "#ff4d4f",
              }}
            />
          </motion.div>

          <Result
            status="403"
            title="Access Restricted"
            subTitle="You don't have permission for this page"
            style={{ padding: 0 }}
          />

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              type="primary"
              size="middle"
              icon={<MailOutlined />}
              onClick={() =>
                (window.location.href = "mailto:admin@example.com")
              }
              style={{
                borderRadius: "6px",
                width: "100%",
                maxWidth: "240px",
              }}
            >
              Contact Admin
            </Button>
          </motion.div>
        </Space>
      </motion.div>
    </motion.div>
  );
};

export default NoPermissionBanner;

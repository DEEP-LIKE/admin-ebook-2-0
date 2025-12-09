import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isPending } = useLogin();

  const onFinish = (values: { username: string; password: string }) => {
    login(values);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #001F3F 0%, #003478 50%, #0066CC 100%)",
      }}
    >
      <Card
        style={{
          width: 450,
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          border: "none",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* Ford Logo */}
          <div
            style={{
              width: 120,
              height: 120,
              margin: "0 auto 24px",
              background: "linear-gradient(135deg, #003478 0%, #0066CC 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0, 52, 120, 0.3)",
            }}
          >
            <svg
              width="70"
              height="70"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="50"
                y="65"
                fontSize="48"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                F
              </text>
            </svg>
          </div>

          <Title level={2} style={{ margin: 0, color: "#003478" }}>
            Ford eBook Admin
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Ingresa tus credenciales para continuar
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 500 }}>Usuario</span>}
            rules={[
              {
                required: true,
                message: "Por favor ingresa tu usuario",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#003478" }} />}
              placeholder="Usuario"
              style={{
                borderRadius: 8,
                padding: "12px 16px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 500 }}>Contraseña</span>}
            rules={[
              {
                required: true,
                message: "Por favor ingresa tu contraseña",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#003478" }} />}
              placeholder="Contraseña"
              style={{
                borderRadius: 8,
                padding: "12px 16px",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              block
              style={{
                height: 48,
                borderRadius: 8,
                background: "linear-gradient(135deg, #003478 0%, #0066CC 100%)",
                border: "none",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0, 52, 120, 0.3)",
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2025 Ford Motor Company. Todos los derechos reservados.
          </Text>
        </div>
      </Card>
    </div>
  );
};

import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Space } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const ContactMailShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Contact Email Details</Title>
      <Descriptions
        bordered
        column={1}
        style={{
          marginTop: 16,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Descriptions.Item label="ID">
          <span style={{ fontFamily: "monospace" }}>#{record?.id}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Email Address">
          <Space>
            <MailOutlined style={{ color: "#003478" }} />
            <a href={`mailto:${record?.email}`}>{record?.email}</a>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

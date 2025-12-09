import { Show } from "@refinedev/antd";
import { Typography, Descriptions } from "antd";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const PromotionShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Promotion Details</Title>
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
        <Descriptions.Item label="Name">
          {record?.name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {record?.description || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

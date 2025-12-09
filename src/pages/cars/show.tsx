import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Image, Space } from "antd";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const CarShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {record?.image?.src && (
          <div style={{ textAlign: "center" }}>
            <Image
              src={record.image.src}
              alt={record.name}
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        )}

        <Title level={5}>Car Details</Title>
        <Descriptions
          bordered
          column={2}
          style={{
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Descriptions.Item label="Menu Position" span={1}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              #{record?.menu_position}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Name" span={1}>
            {record?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Quote (Cotiza)" span={2}>
            {record?.cotiza || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Handling (Manejo)" span={2}>
            {record?.manejo || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="More Info" span={2}>
            {record?.more || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Terms" span={2}>
            {record?.terms || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Extra Data" span={2}>
            {record?.extra_data ? (
              <pre style={{ margin: 0, fontSize: 12 }}>
                {JSON.stringify(JSON.parse(record.extra_data), null, 2)}
              </pre>
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Show>
  );
};

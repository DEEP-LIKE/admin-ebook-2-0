import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Tag, Image, Space } from "antd";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const ImageShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      opengraph: "blue",
      portada: "green",
      cover: "green",
    };
    return colors[type?.toLowerCase()] || "default";
  };

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {record?.src && (
          <div style={{ textAlign: "center" }}>
            <Image
              src={record.src}
              alt={record.filename}
              style={{
                maxWidth: "100%",
                maxHeight: 500,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        )}

        <Title level={5}>Image Details</Title>
        <Descriptions
          bordered
          column={2}
          style={{
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Descriptions.Item label="ID" span={1}>
            <span style={{ fontFamily: "monospace" }}>#{record?.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Type" span={1}>
            {record?.reftype ? (
              <Tag
                color={getTypeColor(record.reftype)}
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {record.reftype.toUpperCase()}
              </Tag>
            ) : (
              <Tag>General</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Filename" span={2}>
            {record?.filename || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="File Path" span={2}>
            <code style={{ fontSize: 12 }}>{record?.filepath || "-"}</code>
          </Descriptions.Item>
          <Descriptions.Item label="MIME Type" span={1}>
            {record?.minetype || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Format" span={1}>
            {record?.minetype?.split("/")[1]?.toUpperCase() || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Alt Text" span={2}>
            {record?.alt || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="URL" span={2}>
            {record?.src ? (
              <a href={record.src} target="_blank" rel="noopener noreferrer">
                {record.src}
              </a>
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Show>
  );
};

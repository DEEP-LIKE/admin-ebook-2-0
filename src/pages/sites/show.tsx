import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Tag, Space, Image } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const SiteShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Site Details</Title>
      <Descriptions
        bordered
        column={2}
        style={{
          marginTop: 16,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Descriptions.Item label="ID" span={1}>
          <span style={{ fontFamily: "monospace" }}>#{record?.id}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag
            icon={
              record?.active ? <CheckCircleOutlined /> : <ClockCircleOutlined />
            }
            color={record?.active ? "success" : "default"}
            style={{
              borderRadius: 20,
              padding: "4px 12px",
              fontWeight: 500,
            }}
          >
            {record?.active ? "Live" : "Draft"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Folder Name" span={2}>
          {record?.folderName}
        </Descriptions.Item>
        <Descriptions.Item label="Title" span={2}>
          {record?.title || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Head Title" span={2}>
          {record?.headTitle || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="URL" span={2}>
          {record?.url ? (
            <a href={record.url} target="_blank" rel="noopener noreferrer">
              {record.url}
            </a>
          ) : (
            "-"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Facebook" span={1}>
          {record?.facebook || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="WhatsApp" span={1}>
          {record?.whatsapp || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Cars" span={1}>
          {record?.cars?.length || 0} vehicles
        </Descriptions.Item>
        <Descriptions.Item label="Contact Emails" span={1}>
          {record?.contact_mails?.length || 0} emails
        </Descriptions.Item>
        <Descriptions.Item label="Terms" span={2}>
          {record?.terms || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Map" span={2}>
          {record?.map ? (
            <div dangerouslySetInnerHTML={{ __html: record.map }} />
          ) : (
            "-"
          )}
        </Descriptions.Item>
        {record?.images?.opengraph && (
          <Descriptions.Item label="OpenGraph Image" span={2}>
            <Image
              src={record.images.opengraph.src}
              alt="OpenGraph"
              style={{ maxWidth: 400, borderRadius: 8 }}
            />
          </Descriptions.Item>
        )}
        {record?.images?.portada && (
          <Descriptions.Item label="Cover Image" span={2}>
            <Image
              src={record.images.portada.src}
              alt="Cover"
              style={{ maxWidth: 400, borderRadius: 8 }}
            />
          </Descriptions.Item>
        )}
      </Descriptions>
    </Show>
  );
};

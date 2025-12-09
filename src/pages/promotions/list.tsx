import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Button, Image } from "antd";
import { PlusOutlined, GiftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

export const PromotionList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        },
      ],
    },
  });

  const navigate = useNavigate();

  return (
    <List
      headerButtons={() => (
        <>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/promotions/create")}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 52, 120, 0.15)",
            }}
          >
            Add Promotion
          </Button>
        </>
      )}
    >
      <Table
        {...tableProps}
        rowKey="id"
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} promotions`,
        }}
      >
        <Table.Column
          dataIndex="id"
          title="ID"
          width={80}
          render={(value) => (
            <span
              style={{
                fontFamily: "monospace",
                color: "#666",
                fontSize: 12,
              }}
            >
              #{value}
            </span>
          )}
        />

        <Table.Column
          dataIndex={["image", "src"]}
          title="Preview"
          width={120}
          render={(value) => (
            <Image
              src={value}
              alt="Promotion Image"
              width={80}
              height={60}
              style={{
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #f0f0f0",
              }}
              preview={{
                mask: "View",
              }}
              fallback="https://via.placeholder.com/80x60?text=No+Img"
            />
          )}
        />

        <Table.Column
          dataIndex="name"
          title="Promotion Name"
          render={(value) => (
            <Space>
              <GiftOutlined style={{ color: "#F59E0B" }} />
              <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                {value || "Untitled Promotion"}
              </span>
            </Space>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          width={150}
          render={(_, record: any) => (
            <Space size="small">
              <ShowButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{
                  borderRadius: 6,
                  transition: "all 0.2s",
                }}
              />
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{
                  borderRadius: 6,
                  transition: "all 0.2s",
                }}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{
                  borderRadius: 6,
                  transition: "all 0.2s",
                }}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

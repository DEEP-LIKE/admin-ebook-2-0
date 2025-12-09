import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Image, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

export const CarList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "menu_position",
          order: "asc",
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
            onClick={() => navigate("/cars/create")}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 52, 120, 0.15)",
            }}
          >
            Add Car
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
          showTotal: (total) => `Total ${total} cars`,
        }}
      >
        <Table.Column
          dataIndex="menu_position"
          title="Position"
          width={100}
          sorter={true}
          render={(value) => (
            <Tag
              color="blue"
              style={{
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              #{value}
            </Tag>
          )}
        />

        <Table.Column
          dataIndex={["image", "src"]}
          title="Image"
          width={120}
          render={(value) =>
            value ? (
              <Image
                src={value}
                alt="car"
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
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 60,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                No image
              </div>
            )
          }
        />

        <Table.Column
          dataIndex="name"
          title="Name"
          render={(value) => (
            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{value}</div>
          )}
        />

        <Table.Column
          dataIndex="cotiza"
          title="Quote"
          width={120}
          render={(value) => (
            <span style={{ color: "#666" }}>{value || "-"}</span>
          )}
        />

        <Table.Column
          dataIndex="manejo"
          title="Handling"
          width={120}
          render={(value) => (
            <span style={{ color: "#666" }}>{value || "-"}</span>
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

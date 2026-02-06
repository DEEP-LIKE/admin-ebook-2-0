import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar, Input, Button, Select } from "antd";
import { SearchOutlined, PlusOutlined, GlobalOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

export const SiteList = () => {
  const { tableProps, setFilters } = useTable({
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
          <Input
            placeholder="Search sites..."
            prefix={<SearchOutlined />}
            style={{
              width: 300,
              borderRadius: 8,
            }}
            onChange={(e) => {
               setFilters([
                {
                  field: "folderName",
                  operator: "contains",
                  value: e.target.value,
                },
               ]);
            }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/sites/create")}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 52, 120, 0.15)",
            }}
          >
            Create Site
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
          showTotal: (total) => `Total ${total} sites`,
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
          dataIndex="folderName"
          title="Site"
          render={(value) => (
            <Space>
              <Avatar
                style={{
                  background: "linear-gradient(135deg, #003478 0%, #0066CC 100%)",
                  fontWeight: "bold",
                }}
              >
                {value?.slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  /{value}
                </div>
              </div>
            </Space>
          )}
        />

        <Table.Column
          dataIndex="active"
          title="Status"
          width={120}
          filters={[
            { text: "Live", value: true },
            { text: "Draft", value: false },
          ]}
          render={(value) => (
            <Tag
              icon={value ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              color={value ? "success" : "default"}
              style={{
                borderRadius: 20,
                padding: "4px 12px",
                fontWeight: 500,
              }}
            >
              {value ? "Live" : "Draft"}
            </Tag>
          )}
        />

        <Table.Column
          dataIndex="cars"
          title="Cars"
          width={100}
          render={(value) => (
            <Tag
              icon={<GlobalOutlined />}
              color="blue"
              style={{
                borderRadius: 6,
                border: "none",
              }}
            >
              {value?.length || 0} cars
            </Tag>
          )}
        />

        <Table.Column
          dataIndex="contact_mails"
          title="Contacts"
          width={250}
          render={(value: any[]) => (
            <Space size={[0, 4]} wrap>
              {value?.map((item: any) => (
                <Tag key={item.id || item} color="blue">
                  {item.email || item}
                </Tag>
              )) || "0 emails"}
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

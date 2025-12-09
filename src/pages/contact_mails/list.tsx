import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Button } from "antd";
import { PlusOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

export const ContactMailList = () => {
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
      headerButtons={({ defaultButtons }) => (
        <>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/contact_mails/create")}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 52, 120, 0.15)",
            }}
          >
            Add Contact Email
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
          showTotal: (total) => `Total ${total} emails`,
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
          dataIndex="email"
          title="Email"
          render={(value) => (
            <Space>
              <MailOutlined style={{ color: "#003478" }} />
              <a href={`mailto:${value}`} style={{ fontWeight: 500 }}>
                {value}
              </a>
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

import { List, useTable, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Image, Button, Upload, message, Select } from "antd";
import { PlusOutlined, InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useCreate, useDeleteMany } from "@refinedev/core";

export const ImageList = () => {
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { mutate: deleteMany } = useDeleteMany();

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select images to delete");
      return;
    }

    deleteMany(
      {
        resource: "images",
        ids: selectedRowKeys as any,
        mutationMode: "undoable",
      },
      {
        onSuccess: () => {
          setSelectedRowKeys([]);
          message.success(`Deleted ${selectedRowKeys.length} images`);
        },
      }
    );
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              style={{
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Delete {selectedRowKeys.length} selected
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/images/create")}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 52, 120, 0.15)",
            }}
          >
            Upload Images
          </Button>
        </>
      )}
    >
      <Table
        {...tableProps}
        rowKey="id"
        rowSelection={rowSelection}
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} images`,
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
          dataIndex="src"
          title="Preview"
          width={120}
          render={(value) => (
            <Image
              src={value}
              alt="preview"
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
          )}
        />

        <Table.Column
          dataIndex="filename"
          title="Filename"
          render={(value) => (
            <div>
              <div style={{ fontWeight: 500, color: "#1a1a1a" }}>
                {value}
              </div>
            </div>
          )}
        />

        <Table.Column
          dataIndex="reftype"
          title="Type"
          width={150}
          filters={[
            { text: "Opengraph", value: "opengraph" },
            { text: "Cover", value: "cover" },
            { text: "Portada", value: "portada" },
          ]}
          render={(value) => {
            if (!value) return <Tag>General</Tag>;
            
            const colors: Record<string, string> = {
              opengraph: "blue",
              portada: "green",
              cover: "green",
            };

            return (
              <Tag
                color={colors[value.toLowerCase()] || "default"}
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {value.toUpperCase()}
              </Tag>
            );
          }}
        />

        <Table.Column
          dataIndex="minetype"
          title="Format"
          width={100}
          render={(value) => (
            <span style={{ color: "#666", fontSize: 12 }}>
              {value?.split("/")[1]?.toUpperCase() || "-"}
            </span>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          width={100}
          render={(_, record: any) => (
            <Space size="small">
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

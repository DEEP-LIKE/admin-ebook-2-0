import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

export const PromotionCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          label="Promotion Name"
          name="name"
          rules={[{ required: true, message: "Please enter promotion name" }]}
        >
          <Input
            size="large"
            placeholder="e.g., Summer Sale 2025"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={4}
            placeholder="Promotion details..."
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Promotion Image" name="image">
          <Upload.Dragger
            maxCount={1}
            beforeUpload={() => false}
            listType="picture"
            style={{
              borderRadius: 12,
              border: "2px dashed #d9d9d9",
              background: "#fafafa",
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478" }} />
            </p>
            <p className="ant-upload-text">Click or drag image to upload</p>
            <p className="ant-upload-hint">
              Support for a single upload.
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

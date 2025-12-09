import { Create, useForm } from "@refinedev/antd";
import { Form, Upload, Select, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

export const ImageCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 10,
    beforeUpload: () => false, // Prevent auto-upload
    accept: "image/*",
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        style={{ maxWidth: 800 }}
      >
        <Form.Item
          label="Reference Type"
          name="reftype"
          rules={[{ required: false }]}
        >
          <Select
            size="large"
            placeholder="Select image type (optional)"
            style={{ borderRadius: 8 }}
            allowClear
            options={[
              { value: "opengraph", label: "OpenGraph" },
              { value: "portada", label: "Portada (Cover)" },
              { value: "cover", label: "Cover" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Images"
          name="images"
          rules={[{ required: true, message: "Please upload at least one image" }]}
        >
          <Upload.Dragger
            {...uploadProps}
            style={{
              borderRadius: 12,
              border: "2px dashed #d9d9d9",
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478", fontSize: 48 }} />
            </p>
            <p
              className="ant-upload-text"
              style={{ fontSize: 16, fontWeight: 500 }}
            >
              Click or drag images to upload
            </p>
            <p className="ant-upload-hint" style={{ color: "#999" }}>
              Support for single or bulk upload. Max 10 images at once.
              <br />
              Accepted formats: JPG, PNG, GIF, WebP
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

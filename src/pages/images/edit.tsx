import { Edit, useForm } from "@refinedev/antd";
import { Form, Upload, Select, Input, Image } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

export const ImageEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  
  const imageData = query?.data?.data;

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => false, // Prevent auto-upload
    accept: "image/*",
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        style={{ maxWidth: 800 }}
      >
        <Form.Item label="ID" name="id">
             <Input disabled style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Current Image">
             {imageData?.src ? (
                 <Image width={200} src={imageData.src} />
             ) : (
                 <span>No image available</span>
             )}
        </Form.Item>

        <Form.Item
          label="Replace Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Upload a new file to replace the current image."
        >
          <Upload.Dragger
            {...uploadProps}
            style={{
              borderRadius: 12,
              border: "2px dashed #d9d9d9",
              background: "#fafafa"
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478", fontSize: 32 }} />
            </p>
            <p className="ant-upload-text">
              Click or drag to replace
            </p>
          </Upload.Dragger>
        </Form.Item>

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
              { value: "cover", label: "Cover" }
            ]}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};

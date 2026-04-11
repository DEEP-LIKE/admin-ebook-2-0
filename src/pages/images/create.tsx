import { Create, useForm } from "@refinedev/antd";
import { Form, Upload, Select, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useState } from "react";
import { useNavigation } from "@refinedev/core";

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

export const ImageCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const [uploading, setUploading] = useState(false);
  const { list } = useNavigation();

  const uploadFile = async (file: File, reftype?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (reftype) formData.append("reftype", reftype);

    const res = await fetch(`${API_URL}/images`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }
    return res.json();
  };

  const customOnFinish = async (values: any) => {
    const fileList = values.images || [];
    const reftype = values.reftype;

    if (fileList.length === 0) {
      message.error("Please select at least one image");
      return;
    }

    setUploading(true);
    try {
      // Upload all files in parallel
      await Promise.all(
        fileList.map((fileObj: any) => {
          const file = fileObj.originFileObj || fileObj;
          return uploadFile(file, reftype);
        })
      );

      message.success(`${fileList.length} images uploaded successfully`);
      list("images");
    } catch (err: any) {
      message.error(err.message || "Error uploading images");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 10,
    beforeUpload: () => false,
    accept: "image/*",
  };

  return (
    <Create 
        saveButtonProps={{ 
            ...saveButtonProps, 
            loading: uploading, 
            disabled: uploading,
            onClick: () => formProps.form?.submit()
        }}
    >
      <Form
        {...formProps}
        onFinish={customOnFinish}
        layout="vertical"
        style={{ maxWidth: 800 }}
      >
        <Form.Item
          label="Reference Type (Applied to all uploaded images)"
          name="reftype"
        >
          <Select
            size="large"
            placeholder="Select image type (optional)"
            style={{ borderRadius: 8 }}
            allowClear
            options={[
              { value: "logo", label: "Logo" },
              { value: "portada", label: "Portada (Cover)" },
              { value: "opengraph", label: "OpenGraph" }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Images"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
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
            <p className="ant-upload-text">Click or drag images to upload</p>
            <p className="ant-upload-hint">Support for single or bulk upload. Max 10 images at once.</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

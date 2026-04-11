import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

async function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/images`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.id;
}

export const PromotionCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const [uploading, setUploading] = useState(false);

  const customOnFinish = async (values: any) => {
    const fileList = values.image || [];
    const file = fileList[0]?.originFileObj;

    if (file) {
      setUploading(true);
      try {
        const imageId = await uploadFile(file);
        values.image_id = imageId;
        delete values.image;
      } catch (err) {
        message.error("Error uploading image");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    return formProps.onFinish?.(values);
  };

  const isSaving = uploading || (saveButtonProps as any)?.loading;

  return (
    <Create saveButtonProps={{ ...saveButtonProps, loading: isSaving, disabled: isSaving }}>
      <Form {...formProps} onFinish={customOnFinish} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          label="Promotion Name"
          name="name"
          rules={[{ required: true, message: "Please enter promotion name" }]}
        >
          <Input size="large" placeholder="e.g., Summer Sale 2025" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Promotion details..." style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label="Promotion Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            const list = Array.isArray(e) ? e : e?.fileList ?? [];
            return list.map((f: any) => ({ ...f, originFileObj: f.originFileObj ?? f }));
          }}
        >
          <Upload.Dragger
            maxCount={1}
            beforeUpload={() => false}
            listType="picture"
            style={{ borderRadius: 12, border: "2px dashed #d9d9d9", background: "#fafafa" }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478" }} />
            </p>
            <p className="ant-upload-text">Click or drag image to upload</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

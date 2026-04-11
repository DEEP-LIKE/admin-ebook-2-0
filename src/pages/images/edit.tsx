import { Edit, useForm } from "@refinedev/antd";
import { Form, Upload, Select, Input, Image, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useState } from "react";
import { useNavigation } from "@refinedev/core";

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

export const ImageEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  const [uploading, setUploading] = useState(false);
  const { list } = useNavigation();
  
  const imageData = query?.data?.data;

  const replaceFile = async (id: number | string, file: File, reftype?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (reftype) formData.append("reftype", reftype);

    const res = await fetch(`${API_URL}/images/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) {
        throw new Error(`Replacement failed`);
    }
    return res.json();
  };

  const customOnFinish = async (values: any) => {
    const fileList = values.image || [];
    const file = fileList[0]?.originFileObj || fileList[0];
    const imageId = values.id;

    setUploading(true);
    try {
        if (file) {
            // If there's a new file, do multipart PATCH
            await replaceFile(imageId, file, values.reftype);
            message.success("Image replaced and updated successfully");
        } else {
            // If only meta changed, use standard Refine PATCH (JSON)
            await formProps.onFinish?.(values);
        }
        formProps.form?.resetFields();
        list("images");
    } catch (err: any) {
        message.error(err.message || "Error updating image");
    } finally {
        setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => false,
    accept: "image/*",
  };

  return (
    <Edit 
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
        <Form.Item label="ID" name="id">
             <Input disabled style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Current Image">
             {imageData?.src ? (
                 <Image width={200} src={imageData.src} style={{ borderRadius: 8, border: "1px solid #eee" }} />
             ) : (
                 <span>No image available</span>
             )}
        </Form.Item>

        <Form.Item
          label="Replace Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
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
            <p className="ant-upload-text">Click or drag to replace</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Reference Type"
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
      </Form>
    </Edit>
  );
};

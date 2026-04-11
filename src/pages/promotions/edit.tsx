import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Upload, Image } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

export const PromotionEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  const promotionData = query?.data?.data;
  
  const [fileList, setFileList] = useState<any[]>([]);
  const [showExistingImage, setShowExistingImage] = useState(true);

  useEffect(() => {
    if (promotionData?.image) {
      setShowExistingImage(true);
    }
  }, [promotionData]);

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
    if (info.fileList.length > 0) {
      setShowExistingImage(false);
    } else if (promotionData?.image) {
      setShowExistingImage(true);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
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

        <Form.Item label="Promotion Image" style={{ marginBottom: 0 }}>
             {showExistingImage && promotionData?.image?.src && (
              <div style={{ marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, display: 'inline-block' }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Current Image:</div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      src={promotionData.image.src}
                      width={200}
                      style={{ borderRadius: 8 }}
                    />
                </div>
              </div>
            )}
        </Form.Item>

        <Form.Item 
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            const list = Array.isArray(e) ? e : e?.fileList ?? [];
            return list.map((f: any) => ({
                ...f,
                originFileObj: f.originFileObj ?? f,
            }));
          }}
        >
          <Upload.Dragger
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
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
    </Edit>
  );
};

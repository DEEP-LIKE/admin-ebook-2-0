import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Typography, Image, message } from "antd";
import { InboxOutlined, LinkOutlined } from "@ant-design/icons";

const { Text } = Typography;
const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

async function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/images`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.id;
}

// Custom Input Component to handle value/onChange correctly within Form.Item
const UrlInput = ({ value, onChange, baseUrl, placeholder }: any) => {
  // Display the slashes as they are
  const displayValue = value || "/";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    // Always enforce leading slash if they type something
    if (newVal && !newVal.startsWith("/")) {
      newVal = "/" + newVal;
    }
    onChange?.(newVal);
  };

  return (
    <div>
      <Input
        addonBefore={baseUrl}
        size="large"
        placeholder={placeholder}
        style={{ borderRadius: 8 }}
        value={displayValue}
        onChange={handleChange}
      />
      {displayValue && displayValue !== "/" && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "#f0f7ff",
            borderRadius: 6,
            border: "1px solid #d6e4ff",
          }}
        >
          <LinkOutlined style={{ color: "#1890ff", marginRight: 6 }} />
          <Text style={{ fontSize: 13, color: "#0050b3" }}>
            URL completa: <strong>{baseUrl}{displayValue}</strong>
          </Text>
        </div>
      )}
    </div>
  );
};

export const CarEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  const carData = query?.data?.data;
  
  // Local state for image management
  const [fileList, setFileList] = useState<any[]>([]);
  const [showExistingImage, setShowExistingImage] = useState(true);
  const [uploading, setUploading] = useState(false);

  // When data loads, if there is an image, we show it by default
  useEffect(() => {
    if (carData?.image) {
      setShowExistingImage(true);
    }
  }, [carData]);

  const baseUrl = "https://www.sitio-ford.mx";

  const customOnFinish = async (values: any) => {
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
    } else {
        delete values.image;
    }

    return formProps.onFinish?.(values);
  };

  // When a new file is added, hide the existing image
  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
    if (info.fileList.length > 0) {
      setShowExistingImage(false);
    } else if (carData?.image) {
      setShowExistingImage(true);
    }
  };

  const isSaving = uploading || (saveButtonProps as any)?.loading;

  return (
    <Edit saveButtonProps={{ ...saveButtonProps, loading: isSaving, disabled: isSaving }}>
      <Form {...formProps} onFinish={customOnFinish} layout="vertical" style={{ maxWidth: 800 }}>
        <Form.Item
          label="Menu Position"
          name="menu_position"
          rules={[{ required: true, message: "Please enter menu position" }]}
        >
          <InputNumber
            size="large"
            min={0}
            style={{ width: "100%", borderRadius: 8 }}
            placeholder="e.g., 1, 2, 3..."
          />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter car name" }]}
        >
          <Input
            size="large"
            placeholder="e.g., Ford Mustang"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              <strong>Botón de Cotiza</strong>
              <br />
              <small style={{ color: "#666", fontWeight: "normal" }}>
                Ruta relativa para el botón "Cotiza tu Ford". Ejemplo: /TERRITORY-HIBRIDA/26/cotizacion
              </small>
            </span>
          }
          name="cotiza"
        >
          <UrlInput 
            baseUrl={baseUrl} 
            placeholder="TERRITORY-HIBRIDA/26/cotizacion" 
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              <strong>Botón de Prueba de Manejo</strong>
              <br />
              <small style={{ color: "#666", fontWeight: "normal" }}>
                Ruta relativa para el botón "Prueba de Manejo". Ejemplo: /TERRITORY/26/PruebadeManejo
              </small>
            </span>
          }
          name="manejo"
        >
          <UrlInput 
            baseUrl={baseUrl} 
            placeholder="TERRITORY/26/PruebadeManejo" 
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              <strong>Botón de Conoce Más</strong>
              <br />
              <small style={{ color: "#666", fontWeight: "normal" }}>
                Ruta relativa para el botón "Conoce Más". Ejemplo: /TERRITORY/26
              </small>
            </span>
          }
          name="more"
        >
          <UrlInput 
            baseUrl={baseUrl} 
            placeholder="TERRITORY/26" 
          />
        </Form.Item>

        <Form.Item label="Terms" name="terms">
          <Input.TextArea
            rows={3}
            placeholder="Terms and conditions"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Extra Data" name="extra_data">
          <Input.TextArea
            rows={3}
            placeholder="Extra data (JSON or text)"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Car Image" style={{ marginBottom: 0 }}>
             {/* Existing Image Display */}
             {showExistingImage && carData?.image?.src && (
              <div style={{ marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, display: 'inline-block' }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>Current Image:</div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      src={carData.image.src}
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
            name="file"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            showUploadList={true}
            listType="picture"
            style={{
              borderRadius: 12,
              border: "2px dashed #d9d9d9",
              background: showExistingImage ? '#fafafa' : '#fff'
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478" }} />
            </p>
            <p className="ant-upload-text">
                {showExistingImage ? "Click or drag to replace image" : "Click or drag car image"}
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Edit>
  );
};

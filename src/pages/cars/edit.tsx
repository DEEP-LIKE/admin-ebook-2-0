import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Typography, Image, Button } from "antd";
import { InboxOutlined, LinkOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Text } = Typography;

// Custom Input Component to handle value/onChange correctly within Form.Item
const UrlInput = ({ value, onChange, baseUrl, placeholder }: any) => {
  // Ensure value is a string and handle the leading slash for display
  const displayValue = value?.startsWith('/') ? value.slice(1) : value || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    // Store with leading slash internally if not empty
    const storedValue = newVal ? (newVal.startsWith('/') ? newVal : `/${newVal}`) : newVal;
    onChange?.(storedValue);
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
      {displayValue && (
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
  const { formProps, saveButtonProps, queryResult, onFinish } = useForm();
  const carData = queryResult?.data?.data;
  
  // Local state for image management
  const [fileList, setFileList] = useState<any[]>([]);
  const [showExistingImage, setShowExistingImage] = useState(true);

  // When data loads, if there is an image, we show it by default
  useEffect(() => {
    if (carData?.image) {
      setShowExistingImage(true);
    }
  }, [carData]);

  const baseUrl = "https://www.sitio-ford.mx";

  const handleFinish = (values: any) => {
    // values.cotiza/manejo/more are already managed by UrlInput to have the slash, 
    // but let's be safe and ensure it.
    // Actually UrlInput `onChange` already sets it with slash.
    
    // Antd Upload puts the file in `image.file` or `image.fileList` depending on how it's used.
    // But since we are using a controlled fileList for the Dragger, we need to ensure 
    // the form receives the file.
    // However, `formProps` handles the form state. 
    // If we use `normFile` or just let Form collect `image`, it might grab the Dragger's internal state.
    
    // We will trust the Form to collect `image` from the Form.Item name="image".
    // But we need to make sure the Dragger inside updates that Item.
    onFinish(values);
  };

  // When a new file is added, hide the existing image
  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
    if (info.fileList.length > 0) {
      setShowExistingImage(false);
    } else if (carData?.image) {
      // If user removed the new file, show existing again? 
      // Or maybe they want to delete everything?
      // Let's assume if list is empty, we show existing if available.
      setShowExistingImage(true);
    }
  };
  

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" style={{ maxWidth: 800 }} onFinish={handleFinish}>
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
            valuePropName="file"
            getValueFromEvent={(e: any) => {
                // Return just the file object or the event, depending on what our dataProvider expects.
                // Our dataProvider now handles { originFileObj } or File or array.
                // Antd Dragger returns an object { file, fileList } in onChange.
                if (Array.isArray(e)) {
                    return e;
                }
                return e && e.fileList;
            }}
        >
          <Upload.Dragger
            name="file"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            showUploadList={true}
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
            <p className="ant-upload-hint">Recommended: 1200x800px</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Edit>
  );
};

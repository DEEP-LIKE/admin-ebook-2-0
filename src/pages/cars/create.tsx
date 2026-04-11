import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Typography } from "antd";
import { InboxOutlined, LinkOutlined } from "@ant-design/icons";

const { Text } = Typography;

const UrlInput = ({ value, onChange, baseUrl, placeholder }: any) => {
  const displayValue = value || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (newVal && !newVal.startsWith('/')) {
        newVal = '/' + newVal;
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
      {displayValue && displayValue !== '/' && (
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

export const CarCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const baseUrl = "https://www.sitio-ford.mx";

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" style={{ maxWidth: 800 }}>
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
                Ruta relativa para el botón "Cotiza". Ejemplo: /TERRITORY/26/Cotizacion
              </small>
            </span>
          }
          name="cotiza"
        >
          <UrlInput 
            baseUrl={baseUrl} 
            placeholder="TERRITORY/26/Cotizacion" 
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

        <Form.Item 
          label="Car Image" 
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
            listType="picture"
            style={{
              borderRadius: 12,
              border: "2px dashed #d9d9d9",
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#003478" }} />
            </p>
            <p className="ant-upload-text">Click or drag car image</p>
            <p className="ant-upload-hint">Recommended: 1200x800px</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};

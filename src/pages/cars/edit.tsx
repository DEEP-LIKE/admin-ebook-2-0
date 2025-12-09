import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Typography } from "antd";
import { InboxOutlined, LinkOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { Text } = Typography;

export const CarEdit = () => {
  const { formProps, saveButtonProps, onFinish } = useForm();
  
  const cotizaValue = Form.useWatch("cotiza", formProps.form);
  const manejoValue = Form.useWatch("manejo", formProps.form);
  const moreValue = Form.useWatch("more", formProps.form);

  const baseUrl = "https://www.sitio-ford.mx/";

  // Transform data before saving - add leading slash if not present
  const handleFinish = (values: any) => {
    const transformedValues = {
      ...values,
      cotiza: values.cotiza && !values.cotiza.startsWith('/') ? `/${values.cotiza}` : values.cotiza,
      manejo: values.manejo && !values.manejo.startsWith('/') ? `/${values.manejo}` : values.manejo,
      more: values.more && !values.more.startsWith('/') ? `/${values.more}` : values.more,
    };
    onFinish(transformedValues);
  };

  // Helper to transform value for display (remove leading slash)
  const getValueProps = (value: string) => {
    return {
      value: value?.startsWith('/') ? value.slice(1) : value || ''
    };
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
          getValueProps={getValueProps}
        >
          <div>
            <Input
              addonBefore={baseUrl}
              size="large"
              placeholder="TERRITORY-HIBRIDA/26/cotizacion"
              style={{ borderRadius: 8 }}
            />
            {cotizaValue && (
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
                  URL completa: <strong>{baseUrl}{cotizaValue}</strong>
                </Text>
              </div>
            )}
          </div>
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
          getValueProps={getValueProps}
        >
          <div>
            <Input
              addonBefore={baseUrl}
              size="large"
              placeholder="TERRITORY/26/PruebadeManejo"
              style={{ borderRadius: 8 }}
            />
            {manejoValue && (
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
                  URL completa: <strong>{baseUrl}{manejoValue}</strong>
                </Text>
              </div>
            )}
          </div>
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
          getValueProps={getValueProps}
        >
          <div>
            <Input
              addonBefore={baseUrl}
              size="large"
              placeholder="TERRITORY/26"
              style={{ borderRadius: 8 }}
            />
            {moreValue && (
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
                  URL completa: <strong>{baseUrl}{moreValue}</strong>
                </Text>
              </div>
            )}
          </div>
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

        <Form.Item label="Car Image" name="image">
          <Upload.Dragger
            maxCount={1}
            beforeUpload={() => false}
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
    </Edit>
  );
};

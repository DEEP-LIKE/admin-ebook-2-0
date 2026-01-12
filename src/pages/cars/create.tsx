import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

export const CarCreate = () => {
  const { formProps, saveButtonProps } = useForm();

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

        <Form.Item label="Quote (Cotiza)" name="cotiza">
          <Input.TextArea
            rows={3}
            placeholder="Quote information"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Handling (Manejo)" name="manejo">
          <Input.TextArea
            rows={3}
            placeholder="Handling information"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="More Info" name="more">
          <Input.TextArea
            rows={3}
            placeholder="Additional information"
            style={{ borderRadius: 8 }}
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

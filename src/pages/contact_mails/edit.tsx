import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const ContactMailEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email address" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            size="large"
            placeholder="contact@example.com"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Switch, Tabs, Select, Upload, Avatar, Space, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Tag } from "antd";

export const SiteCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  const { selectProps: carSelectProps, query: carQueryResult } = useSelect({
    resource: "cars",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
    sorters: [
      {
        field: "menu_position",
        order: "asc",
      },
    ],
  });

  const { selectProps: promoSelectProps, query: promoQueryResult } = useSelect({
    resource: "promotions",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 1000 },
  });

  const { selectProps: contactSelectProps, query: contactQueryResult } = useSelect({
    resource: "contact_mails",
    optionLabel: "email",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
    sorters: [
      {
        field: "email",
        order: "asc",
      },
    ],
  });

  // Enhance options with image data for custom rendering
  const carOptions = [
    ...(carQueryResult.data?.data?.map((item: any) => ({
      label: item.name,
      value: `car_${item.id}`,
      image: item.image?.src,
      desc: `Position: ${item.menu_position}`,
      type: 'Car'
    })) || []),
    ...(promoQueryResult.data?.data?.map((item: any) => ({
      label: item.name,
      value: `promo_${item.id}`,
      image: item.image?.src,
      desc: item.description || 'Promotion',
      type: 'Promotion'
    })) || [])
  ];

  const contactOptions = contactQueryResult.data?.data?.map((item: any) => ({
    label: item.email,
    value: item.id,
  })) || [];

  const customOnFinish = (values: any) => {
    const vehicles = values.vehicles || [];
    values.cars_ids = vehicles
      .filter((v: string) => v.startsWith("car_"))
      .map((v: string) => parseInt(v.split("_")[1]));
      
    values.promotions_ids = vehicles
      .filter((v: string) => v.startsWith("promo_"))
      .map((v: string) => parseInt(v.split("_")[1]));
      
    delete values.vehicles;
    
    return formProps.onFinish?.(values);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        onFinish={customOnFinish}
        layout="vertical"
        style={{ maxWidth: 800 }}
      >
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: "general",
              label: "General Info",
              children: (
                <>
                  <Form.Item
                    label="Folder Name"
                    name="folderName"
                    rules={[
                      { required: true, message: "Please enter folder name" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., fordcavsamotors"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Title"
                    name="title"
                  >
                    <Input
                      size="large"
                      placeholder="Site title"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Head Title"
                    name="headTitle"
                  >
                    <Input
                      size="large"
                      placeholder="SEO title"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Logo Distribuidor"
                    name="logo_file"
                    help="Upload the official company logo"
                    valuePropName="fileList"
                    getValueFromEvent={(e: any) => {
                      if (Array.isArray(e)) return e;
                      return e?.fileList;
                    }}
                  >
                    <Upload.Dragger
                      maxCount={1}
                      beforeUpload={() => false}
                      style={{
                        borderRadius: 12,
                        border: "2px dashed #d9d9d9",
                        padding: '10px'
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#003478" }} />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag Logo
                      </p>
                    </Upload.Dragger>
                  </Form.Item>

                  <Form.Item
                    label="Active Status"
                    name="active"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch
                      checkedChildren="Live"
                      unCheckedChildren="Draft"
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "cars",
              label: "Vehicles & Promotions",
              children: (
                <Form.Item
                  label="Select Cars & Promotions"
                  name="vehicles"
                  help="Select the cars and promotions available for this site"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select cars and promotions..."
                    style={{ width: "100%" }}
                    options={carOptions}
                    loading={carSelectProps.loading || promoSelectProps.loading}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    optionRender={(option) => (
                      <Space>
                        <Avatar 
                          shape="square" 
                          src={option.data.image} 
                          alt={option.data.label}
                          size="large"
                        />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <Space>
                            <Typography.Text strong>{option.data.label}</Typography.Text>
                            <Tag color={option.data.type === 'Promotion' ? 'gold' : 'blue'}>
                              {option.data.type}
                            </Tag>
                          </Space>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {option.data.desc}
                          </Typography.Text>
                        </div>
                      </Space>
                    )}
                  />
                </Form.Item>
              ),
            },
            {
              key: "contacts",
              label: "Contacts",
              children: (
                <Form.Item
                  label="Select Contacts"
                  name="contact_mails_ids"
                  help="Select the contact emails for this site"
                >
                  <Select
                    {...contactSelectProps}
                    mode="multiple"
                    placeholder="Select contacts..."
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ),
            },
            {
              key: "content",
              label: "Content",
              children: (
                <>
                  <Form.Item
                    label="URL"
                    name="url"
                  >
                    <Input
                      size="large"
                      placeholder="https://..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Terms & Conditions"
                    name="terms"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Enter terms and conditions"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Map Embed"
                    name="map"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Google Maps embed code"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "social",
              label: "Social Media",
              children: (
                <>
                  <Form.Item
                    label="Facebook URL"
                    name="facebook"
                  >
                    <Input
                      size="large"
                      placeholder="https://facebook.com/..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="WhatsApp Number"
                    name="whatsapp"
                  >
                    <Input
                      size="large"
                      placeholder="+52..."
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "media",
              label: "Media",
              children: (
                <>
                  <Form.Item
                    label="OpenGraph Image"
                    name="opengraph_file"
                    valuePropName="fileList"
                    getValueFromEvent={(e: any) => {
                      if (Array.isArray(e)) return e;
                      return e?.fileList;
                    }}
                  >
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
                      <p className="ant-upload-text">
                        Click or drag OpenGraph image
                      </p>
                      <p className="ant-upload-hint">
                        Recommended: 1200x630px
                      </p>
                    </Upload.Dragger>
                  </Form.Item>

                  <Form.Item
                    label="Cover Image"
                    name="portada_file"
                    valuePropName="fileList"
                    getValueFromEvent={(e: any) => {
                      if (Array.isArray(e)) return e;
                      return e?.fileList;
                    }}
                  >
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
                      <p className="ant-upload-text">
                        Click or drag cover image
                      </p>
                      <p className="ant-upload-hint">
                        Recommended: 1920x1080px
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Create>
  );
};

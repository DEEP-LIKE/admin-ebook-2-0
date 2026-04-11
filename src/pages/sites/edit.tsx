import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Switch,
  Tabs,
  Select,
  Upload,
  Avatar,
  Space,
  Typography,
  Button,
  Popconfirm,
  message,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { Tag } from "antd";

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

// ─── Helper: sube un archivo y devuelve el image_id ───────────────────────────
async function uploadFile(file: File, siteId: string | number): Promise<number> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("site_id", String(siteId));

  const res = await fetch(`${API_URL}/images`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // La API devuelve { id: number, ... } o { image: { id: number } }
  return data.id ?? data.image?.id;
}

export const SiteEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  const siteData = query?.data?.data;
  const { id } = useParams();

  const [deletedReftypes, setDeletedReftypes] = useState<string[]>([]);
  // Guardar si el usuario eligió subir imágenes (para mostrar spinner)
  const [uploading, setUploading] = useState(false);

  const { selectProps: carSelectProps, query: carQueryResult } = useSelect({
    resource: "cars",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "menu_position", order: "asc" }],
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
    pagination: { pageSize: 1000 },
    sorters: [{ field: "email", order: "asc" }],
  });

  const logoImage = !deletedReftypes.includes("logo")
    ? siteData?.images?.find((img: any) => img?.reftype?.toLowerCase() === "logo")
    : null;
  const portadaImage = !deletedReftypes.includes("portada")
    ? siteData?.images?.find((img: any) => img?.reftype?.toLowerCase() === "portada")
    : null;
  const opengraphImage = !deletedReftypes.includes("opengraph")
    ? siteData?.images?.find((img: any) => img?.reftype?.toLowerCase() === "opengraph")
    : null;

  const handleDeleteImage = async (imageId: number, reftype: string) => {
    try {
      const res = await fetch(`${API_URL}/images/${imageId}`, { method: "DELETE" });
      if (res.ok) {
        setDeletedReftypes((prev) => [...prev, reftype]);
        message.success(`${reftype} image deleted successfully`);
      } else {
        message.error("Failed to delete image");
      }
    } catch (error) {
      message.error("Error deleting image");
      console.error("Delete image error:", error);
    }
  };

  const carOptions = [
    ...(carQueryResult.data?.data?.map((item: any) => ({
      label: item.name,
      value: `car_${item.id}`,
      image: item.images?.[0]?.src ?? item.image?.src,
      desc: `Position: ${item.menu_position}`,
      type: "Car",
    })) || []),
    ...(promoQueryResult.data?.data?.map((item: any) => ({
      label: item.name,
      value: `promo_${item.id}`,
      image: item.image?.src,
      desc: item.description || "Promotion",
      type: "Promotion",
    })) || []),
  ];

  const normFileList = (e: any) => {
    const list = Array.isArray(e) ? e : e?.fileList ?? [];
    return list.map((f: any) => ({
      ...f,
      originFileObj: f.originFileObj ?? f,
    }));
  };

  useEffect(() => {
    if (siteData) {
      const cars = siteData.cars_ids?.map((cid: number) => `car_${cid}`) || [];
      const promos = siteData.promotions_ids?.map((pid: number) => `promo_${pid}`) || [];
      formProps.form?.setFieldsValue({ vehicles: [...cars, ...promos] });
      // Reset deleted states when data is loaded/refreshed
      setDeletedReftypes([]);
    }
  }, [siteData]);

  // ─── onFinish: sube imágenes primero, luego PATCH ─────────────────────────
  const customOnFinish = async (values: any) => {
    if (!id) return;

    // 1. Separar vehicles → cars_ids + promotions_ids
    // Solo procesar si el campo 'vehicles' existe en los valores (evita borrado accidental)
    if ('vehicles' in values) {
        const vehicles: string[] = values.vehicles || [];
        values.cars_ids = vehicles
          .filter((v) => v.startsWith("car_"))
          .map((v) => parseInt(v.split("_")[1]));
        values.promotions_ids = vehicles
          .filter((v) => v.startsWith("promo_"))
          .map((v) => parseInt(v.split("_")[1]));
        delete values.vehicles;
    }

    // 2. Recoger archivos a subir (logo, opengraph, portada)
    const fileFields: { fieldName: string; reftype: string }[] = [
      { fieldName: "logo_file", reftype: "logo" },
      { fieldName: "opengraph_file", reftype: "opengraph" },
      { fieldName: "portada_file", reftype: "portada" },
    ];

    const filesToUpload = fileFields
      .map(({ fieldName, reftype }) => {
        const fileList: any[] = values[fieldName] || [];
        // BUSCAR el archivo que tenga originFileObj (el nuevo subido)
        const newFile = fileList.find(f => f.originFileObj)?.originFileObj;
        return newFile ? { file: newFile, reftype } : null;
      })
      .filter(Boolean) as { file: File; reftype: string }[];

    // Limpiar campos de archivo del payload antes de enviar
    fileFields.forEach(({ fieldName }) => delete values[fieldName]);

    // 3. Subir archivos y construir image_updates
    if (filesToUpload.length > 0) {
      setUploading(true);
      try {
        const uploadResults = await Promise.all(
          filesToUpload.map(async ({ file, reftype }) => {
            console.log(`[edit] Uploading ${reftype}:`, file.name);
            const imageId = await uploadFile(file, id);
            console.log(`[edit] Uploaded ${reftype} → image_id=${imageId}`);
            return { image_id: imageId, reftype };
          })
        );
        values.image_updates = uploadResults;
        console.log("[edit] image_updates:", uploadResults);
      } catch (err: any) {
        message.error(`Error uploading image: ${err.message}`);
        console.error("[edit] Upload error:", err);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    console.log("[edit] Final PATCH payload:", values);

    // 4. Delegar a Refine para que haga el PATCH
    try {
      await formProps.onFinish?.(values);
      // Si llegamos aquí, se guardó correctamente. Limpiamos estados locales de borrado.
      setDeletedReftypes([]);
    } catch (err) {
      console.error("[edit] PATCH error:", err);
    }
  };

  const isSaving = uploading || (saveButtonProps as any)?.loading;

  return (
    <Edit
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSaving,
        disabled: isSaving,
      }}
    >
      <Form {...formProps} onFinish={customOnFinish} layout="vertical" style={{ maxWidth: 800 }}>
        <Tabs
          defaultActiveKey="general"
          items={[
            // ── General Info ────────────────────────────────────────────────
            {
              key: "general",
              label: "General Info",
              children: (
                <>
                  <Form.Item
                    label="Folder Name"
                    name="folderName"
                    rules={[{ required: true, message: "Please enter folder name" }]}
                  >
                    <Input size="large" placeholder="e.g., fordcavsamotors" style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item label="Title" name="title">
                    <Input size="large" placeholder="Site title" style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item label="Head Title" name="headTitle">
                    <Input size="large" placeholder="SEO title" style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Form.Item
                    label="Logo Distribuidor"
                    name="logo_file"
                    help="Upload the official company logo"
                    valuePropName="fileList"
                    getValueFromEvent={normFileList}
                  >
                    <Upload.Dragger
                      maxCount={1}
                      beforeUpload={() => false}
                      style={{ borderRadius: 12, border: "2px dashed #d9d9d9", padding: "10px" }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#003478" }} />
                      </p>
                      <p className="ant-upload-text">Click or drag Logo</p>
                    </Upload.Dragger>

                    {logoImage && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 15 }}>
                        <div>
                          <Typography.Text type="secondary">Current Logo:</Typography.Text>
                          <br />
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                            <Avatar
                              shape="square"
                              size={64}
                              src={logoImage.src}
                              style={{ border: "1px solid #d9d9d9" }}
                            />
                            <Popconfirm
                              title="Delete logo?"
                              description="This will permanently remove the current logo."
                              onConfirm={() => handleDeleteImage(logoImage.id, "logo")}
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                            >
                              <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                                Remove
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label="Active Status" name="active" valuePropName="checked">
                    <Switch
                      checkedChildren="Live"
                      unCheckedChildren="Draft"
                      style={{ background: siteData?.active ? "#10B981" : "#d9d9d9" }}
                    />
                  </Form.Item>
                </>
              ),
            },

            // ── Vehicles & Promotions ────────────────────────────────────────
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
                            <Tag color={option.data.type === "Promotion" ? "gold" : "blue"}>
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

            // ── Contacts ─────────────────────────────────────────────────────
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

            // ── Content ───────────────────────────────────────────────────────
            {
              key: "content",
              label: "Content",
              children: (
                <>
                  <Form.Item label="URL" name="url">
                    <Input size="large" placeholder="https://..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Message – Sent" name="msg_enviado">
                    <Input size="large" placeholder="Tu mensaje fue enviado correctamente." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Message – Failed" name="msg_fallido">
                    <Input size="large" placeholder="Ocurrió un error al enviar tu mensaje." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Terms & Conditions" name="terms">
                    <Input.TextArea rows={4} placeholder="Enter terms and conditions" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Map Embed" name="map">
                    <Input.TextArea rows={3} placeholder="Google Maps embed code" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Map URL" name="mapurl">
                    <Input size="large" placeholder="https://maps.google.com/..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Waze URL" name="waze">
                    <Input size="large" placeholder="https://waze.com/..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                </>
              ),
            },

            // ── Social Media ─────────────────────────────────────────────────
            {
              key: "social",
              label: "Social Media",
              children: (
                <>
                  <Form.Item label="Facebook URL" name="facebook">
                    <Input size="large" placeholder="https://facebook.com/..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="WhatsApp Number" name="whatsapp">
                    <Input size="large" placeholder="+52..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                </>
              ),
            },

            // ── Media ─────────────────────────────────────────────────────────
            {
              key: "media",
              label: "Media",
              children: (
                <>
                  {/* OpenGraph */}
                  <Form.Item
                    label="OpenGraph Image"
                    name="opengraph_file"
                    valuePropName="fileList"
                    getValueFromEvent={normFileList}
                  >
                    <Upload.Dragger
                      maxCount={1}
                      beforeUpload={() => false}
                      style={{ borderRadius: 12, border: "2px dashed #d9d9d9" }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#003478" }} />
                      </p>
                      <p className="ant-upload-text">Click or drag OpenGraph image</p>
                      <p className="ant-upload-hint">Recommended: 1200x630px</p>
                    </Upload.Dragger>

                    {opengraphImage && (
                      <div style={{ marginTop: 10 }}>
                        <Typography.Text type="secondary">Current OpenGraph:</Typography.Text>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <Avatar
                            shape="square"
                            size={64}
                            src={opengraphImage.src}
                            style={{ border: "1px solid #d9d9d9" }}
                          />
                          <Popconfirm
                            title="Delete OpenGraph image?"
                            onConfirm={() => handleDeleteImage(opengraphImage.id, "opengraph")}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                              Remove
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  {/* Portada */}
                  <Form.Item
                    label="Cover Image"
                    name="portada_file"
                    valuePropName="fileList"
                    getValueFromEvent={normFileList}
                  >
                    <Upload.Dragger
                      maxCount={1}
                      beforeUpload={() => false}
                      style={{ borderRadius: 12, border: "2px dashed #d9d9d9" }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#003478" }} />
                      </p>
                      <p className="ant-upload-text">Click or drag cover image</p>
                      <p className="ant-upload-hint">Recommended: 1920x1080px</p>
                    </Upload.Dragger>

                    {portadaImage && (
                      <div style={{ marginTop: 10 }}>
                        <Typography.Text type="secondary">Current Cover:</Typography.Text>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <Avatar
                            shape="square"
                            size={64}
                            src={portadaImage.src}
                            style={{ border: "1px solid #d9d9d9" }}
                          />
                          <Popconfirm
                            title="Delete cover image?"
                            onConfirm={() => handleDeleteImage(portadaImage.id, "portada")}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                              Remove
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Edit>
  );
};
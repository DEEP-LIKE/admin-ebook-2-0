import { DataProvider, BaseRecord, BaseKey, GetListParams, CreateParams, UpdateParams, DeleteManyParams, GetListResponse, CreateResponse, UpdateResponse, DeleteManyResponse, Pagination } from "@refinedev/core";
import queryString from "query-string";

interface CustomVariables {
  images?: {
    opengraph?: { rawFile?: File };
    portada?: { rawFile?: File };
    logo?: { rawFile?: File };
    rawFile?: File;
  };
  image_id?: string | number;
  reftype?: string;
  [key: string]: any;
}

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

// Helper: Upload de imágenes
const uploadImage = async (formData: FormData): Promise<any> => {
  const response = await fetch(`${API_URL}/images`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};

// Helper: Extraer archivo raw de diferentes estructuras de Ant Design Upload
const getRawFile = (value: any): File | undefined => {
  if (!value) return undefined;

  // Caso 1: Array de archivos (fileList) — produced by normFileList in SiteEdit
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i--) {
      const item = value[i];
      if (item instanceof File) return item;
      if (item?.originFileObj instanceof File) return item.originFileObj;
      // normFileList copies originFileObj; also try the item itself if it has a name
      if (item?.name && item?.size) return item as unknown as File;
    }
    return undefined;
  }

  // Caso 2: Objeto Upload change event { file, fileList }
  if (value.fileList && Array.isArray(value.fileList)) {
    for (let i = value.fileList.length - 1; i >= 0; i--) {
      const item = value.fileList[i];
      if (item?.originFileObj instanceof File) return item.originFileObj;
    }
  }

  // Caso 3: Objeto directo
  if (value.originFileObj instanceof File) return value.originFileObj;
  if (value instanceof File) return value;
  if (value.file?.originFileObj instanceof File) return value.file.originFileObj;

  return undefined;
};

// Helper: Detectar si hay imágenes para subir
const hasImageUpload = (variables: any): boolean => {
  return (
    !!getRawFile(variables?.images) ||
    !!getRawFile(variables?.image) ||
    !!getRawFile(variables?.images?.opengraph) ||
    !!getRawFile(variables?.images?.portada) ||
    !!getRawFile(variables?.images?.logo) ||
    !!getRawFile(variables?.logo_file) ||
    !!getRawFile(variables?.portada_file) ||
    !!getRawFile(variables?.opengraph_file)
  );
};

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters = [],
    sorters = [],
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const current = (pagination as any)?.current || 1;
    const pageSize = (pagination as any)?.pageSize || 10;
    const { field = "id", order = "ASC" } = sorters?.[0] ?? {};

    const query: Record<string, any> = {
      page: current,
      pageSize,
      sortBy: field,
      sortOrder: order,
    };

    if (filters && filters.length > 0) {
      const folderNameFilter = filters.find((f: any) => f.field === "folderName");

      if (folderNameFilter && folderNameFilter.value && folderNameFilter.value.trim() !== "") {
        const searchValue = `%${folderNameFilter.value}%`;
        const otherFilters = filters.filter((f: any) => f.field !== "folderName");
        const filterObj = otherFilters.reduce((acc: any, filter: any) => {
          acc[filter.field] = filter.value;
          return acc;
        }, {});
        filterObj.folderName = searchValue;
        query.filter = JSON.stringify(filterObj);
      } else {
        const validFilters = filters.filter(
          (f: any) => f.field !== "folderName" || (f.value && f.value.trim() !== "")
        );
        if (validFilters.length > 0) {
          const filterObj = validFilters.reduce((acc: any, filter: any) => {
            if ("field" in filter) {
              if (filter.operator === "contains" && typeof filter.value === "string") {
                acc[filter.field] = `%${filter.value}%`;
              } else {
                acc[filter.field] = filter.value;
              }
            }
            return acc;
          }, {});
          query.filter = JSON.stringify(filterObj);
        }
      }
    }

    const url = `${API_URL}/${resource}?${queryString.stringify(query)}`;
    const response = await fetch(url);
    const json = await response.json();

    const resourceKey = Object.keys(json)[0];
    const data = json[resourceKey] || [];
    const total = json.range?.total || data.length;

    return { data, total };
  },

  getOne: async ({ resource, id }: { resource: string; id: BaseKey }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`);
    const data = await response.json();
    return { data };
  },

  getMany: async ({ resource, ids }: { resource: string; ids: BaseKey[] }) => {
    const query = { filter: JSON.stringify({ id: ids }) };
    const url = `${API_URL}/${resource}?${queryString.stringify(query)}`;
    const response = await fetch(url);
    const json = await response.json();
    const resourceKey = Object.keys(json)[0];
    const data = json[resourceKey] || [];
    return { data };
  },

  create: async <TData extends BaseRecord = BaseRecord, TVariables = any>({
    resource,
    variables,
  }: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
    const typedVars = variables as any;
    let finalVariables = { ...typedVars };

    console.log("Create variables raw:", typedVars);

    if (hasImageUpload(typedVars)) {
      const imageUpdates = [];

      const singularImage = getRawFile(typedVars.image);
      if (singularImage) {
        const formData = new FormData();
        formData.append("file", singularImage);
        try {
          const uploaded = await uploadImage(formData);
          if (uploaded && uploaded.id) {
            finalVariables.image_id = uploaded.id;
            finalVariables.image = uploaded.id;
          }
        } catch (error) {
          console.error("Error uploading singular image", error);
        }
      }

      const opengraphFile = getRawFile(typedVars.images?.opengraph);
      if (opengraphFile) {
        const formData = new FormData();
        formData.append("file", opengraphFile);
        const uploaded = await uploadImage(formData);
        imageUpdates.push({ image_id: uploaded.id, reftype: "opengraph" });
      }

      const portadaFile = getRawFile(typedVars.images?.portada);
      if (portadaFile) {
        const formData = new FormData();
        formData.append("file", portadaFile);
        const uploaded = await uploadImage(formData);
        imageUpdates.push({ image_id: uploaded.id, reftype: "portada" });
      }

      const logoFile = getRawFile(typedVars.images?.logo);
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploaded = await uploadImage(formData);
        imageUpdates.push({ image_id: uploaded.id, reftype: "logo" });
      }

      if (imageUpdates.length > 0) {
        finalVariables.image_updates = imageUpdates;
        finalVariables.image_id = imageUpdates[imageUpdates.length - 1].image_id;
        finalVariables.reftype = imageUpdates[imageUpdates.length - 1].reftype;
      }

      delete finalVariables.images;
    }

    // Special handling for 'images' resource
    if (resource === "images") {
      const imagesField = typedVars.images;
      let filesToUpload: File[] = [];

      if (Array.isArray(imagesField)) {
        filesToUpload = imagesField.map((f: any) => f.originFileObj || f).filter((f) => f instanceof File);
      } else if (imagesField && imagesField.fileList) {
        filesToUpload = imagesField.fileList.map((f: any) => f.originFileObj).filter((f: any) => f instanceof File);
      } else if (imagesField instanceof File) {
        filesToUpload = [imagesField];
      }

      let lastResult: any = {};
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const uploaded = await uploadImage(formData);
          lastResult = uploaded;
          if (typedVars.reftype) {
            await fetch(`${API_URL}/images/${uploaded.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reftype: typedVars.reftype }),
            });
            lastResult = { ...lastResult, reftype: typedVars.reftype };
          }
        } catch (err) {
          console.error("Error uploading file in images resource", err);
          throw err;
        }
      }
      return { data: lastResult };
    }

    const response = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalVariables),
    });
    const data = await response.json();
    return { data };
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = any>({
    resource,
    id,
    variables,
  }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    const typedVars = variables as any;
    let finalVariables = { ...typedVars };

    // ─── Debug: log exactly what files arrived ───────────────────────────────
    const debugFiles = {
      logo_file: typedVars.logo_file,
      logo_rawFile: getRawFile(typedVars.logo_file),
      portada_file: typedVars.portada_file,
      portada_rawFile: getRawFile(typedVars.portada_file),
      opengraph_file: typedVars.opengraph_file,
      opengraph_rawFile: getRawFile(typedVars.opengraph_file),
      hasUpload: hasImageUpload(typedVars),
    };
    console.log("Update into", resource, id, typedVars);
    console.log("Update file debug:", debugFiles);
    // ─────────────────────────────────────────────────────────────────────────

    // Special case: images resource replaces the file directly
    if (resource === "images") {
      const file = getRawFile(typedVars.image);
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        if (typedVars.reftype) formData.append("reftype", typedVars.reftype);
        const response = await fetch(`${API_URL}/images/${id}`, {
          method: "PATCH",
          body: formData,
        });
        const data = await response.json();
        return { data };
      }
    }

    if (hasImageUpload(typedVars) && resource !== "images") {
      const imageUpdates = [];

      // 1. Singular 'image' field (Cars, Promotions)
      const singularImage = getRawFile(typedVars.image);
      if (singularImage) {
        const formData = new FormData();
        formData.append("file", singularImage);
        try {
          const uploaded = await uploadImage(formData);
          finalVariables.image_id = uploaded.id;
          finalVariables.image = uploaded.id;
        } catch (e) {
          console.error("Update upload failed", e);
        }
      }

      // 2. logo_file → reftype: logo
      const logoFile = getRawFile(typedVars.logo_file) ?? getRawFile(typedVars.images?.logo);
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name, logoFile.size);
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploaded = await uploadImage(formData);
        console.log("Logo uploaded:", uploaded);
        imageUpdates.push({ image_id: uploaded.id, reftype: "logo" });
      }

      // 3. opengraph_file → reftype: opengraph
      const opengraphFile = getRawFile(typedVars.opengraph_file) ?? getRawFile(typedVars.images?.opengraph);
      if (opengraphFile) {
        console.log("Uploading opengraph file:", opengraphFile.name, opengraphFile.size);
        const formData = new FormData();
        formData.append("file", opengraphFile);
        const uploaded = await uploadImage(formData);
        imageUpdates.push({ image_id: uploaded.id, reftype: "opengraph" });
      }

      // 4. portada_file → reftype: portada
      const portadaFile = getRawFile(typedVars.portada_file) ?? getRawFile(typedVars.images?.portada);
      if (portadaFile) {
        console.log("Uploading portada file:", portadaFile.name, portadaFile.size);
        const formData = new FormData();
        formData.append("file", portadaFile);
        const uploaded = await uploadImage(formData);
        imageUpdates.push({ image_id: uploaded.id, reftype: "portada" });
      }

      if (imageUpdates.length > 0) {
        finalVariables.image_updates = imageUpdates;
        // Backwards compatibility
        finalVariables.image_id = imageUpdates[imageUpdates.length - 1].image_id;
        finalVariables.reftype = imageUpdates[imageUpdates.length - 1].reftype;
      }
    }

    // Always clean up file fields before sending JSON to API
    delete finalVariables.images;
    delete finalVariables.logo_file;
    delete finalVariables.portada_file;
    delete finalVariables.opengraph_file;

    console.log("Final PATCH payload:", finalVariables);

    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalVariables),
    });

    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }: { resource: string; id: BaseKey }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE" });
    const data = await response.json();
    return { data };
  },

  deleteMany: async <TData extends BaseRecord = BaseRecord, TVariables = any>({
    resource,
    ids,
  }: DeleteManyParams<TVariables>): Promise<DeleteManyResponse<TData>> => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    await Promise.all(
      ids.map((id) => fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE", headers }))
    );
    return { data: ids.map((id) => ({ id } as unknown as TData)) };
  },

  getApiUrl: () => API_URL,
};
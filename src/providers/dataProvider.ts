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
    const response = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    const data = await response.json();
    return { data };
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = any>({
    resource,
    id,
    variables,
  }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
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
import { DataProvider, BaseRecord, BaseKey, GetListParams, CreateParams, UpdateParams, DeleteManyParams, GetListResponse, CreateResponse, UpdateResponse, DeleteManyResponse, Pagination } from "@refinedev/core";
import queryString from "query-string";

interface CustomVariables {
  images?: {
    opengraph?: {
      rawFile?: File;
    };
    portada?: {
      rawFile?: File;
    };
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

// Helper: Detectar si hay imágenes para subir
const hasImageUpload = (variables: any): boolean => {
  return (
    variables?.images?.rawFile ||
    variables?.images?.opengraph?.rawFile ||
    variables?.images?.portada?.rawFile ||
    variables?.image?.rawFile
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
      // Check if there's a folderName filter for search
      const folderNameFilter = filters.find((f: any) => f.field === "folderName");
      
      if (folderNameFilter && folderNameFilter.value && folderNameFilter.value.trim() !== "") {
        // Use wildcard pattern for partial search in folderName
        const searchValue = `%${folderNameFilter.value}%`;
        
        // Build filter object with wildcard search
        const otherFilters = filters.filter((f: any) => f.field !== "folderName");
        const filterObj = otherFilters.reduce((acc: any, filter: any) => {
          acc[filter.field] = filter.value;
          return acc;
        }, {});
        
        // Add folderName with wildcard
        filterObj.folderName = searchValue;
        query.filter = JSON.stringify(filterObj);
      } else {
        // Normal filter handling (excluding empty folderName)
        const validFilters = filters.filter((f: any) => 
          f.field !== "folderName" || (f.value && f.value.trim() !== "")
        );
        
        if (validFilters.length > 0) {
          const filterObj = validFilters.reduce((acc: any, filter: any) => {
            acc[filter.field] = filter.value;
            return acc;
          }, {});
          query.filter = JSON.stringify(filterObj);
        }
      }
    }

    const url = `${API_URL}/${resource}?${queryString.stringify(query)}`;
    const response = await fetch(url);
    const json = await response.json();

    // Adaptación de la respuesta de la API
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
    const query = {
      filter: JSON.stringify({ id: ids }),
    };
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

    // Manejo especial de imágenes
    if (hasImageUpload(typedVars)) {
      // Si es una imagen de opengraph
      if (typedVars.images?.opengraph?.rawFile) {
        const formData = new FormData();
        formData.append("file", typedVars.images.opengraph.rawFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "opengraph";
      }
      // Si es una imagen de portada
      else if (typedVars.images?.portada?.rawFile) {
        const formData = new FormData();
        formData.append("file", typedVars.images.portada.rawFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "portada";
      }
      // Si es una imagen genérica
      else if (typedVars.images?.rawFile) {
        const formData = new FormData();
        formData.append("file", typedVars.images.rawFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
      }
      delete finalVariables.images;
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

    // Manejo especial de imágenes (similar a create)
    if (hasImageUpload(typedVars)) {
      if (typedVars.images?.opengraph?.rawFile) {
        const formData = new FormData();
        formData.append("file", typedVars.images.opengraph.rawFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "opengraph";
      } else if (typedVars.images?.portada?.rawFile) {
        const formData = new FormData();
        formData.append("file", typedVars.images.portada.rawFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "portada";
      }
      delete finalVariables.images;
    }

    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalVariables),
    });

    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }: { resource: string; id: BaseKey }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
    });
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
      ids.map((id) =>
        fetch(`${API_URL}/${resource}/${id}`, {
          method: "DELETE",
          headers,
        })
      )
    );

    return {
      data: ids.map((id) => ({ id } as unknown as TData)),
    };
    // Removed duplicate delete implementation
  },

  getApiUrl: () => API_URL,
};

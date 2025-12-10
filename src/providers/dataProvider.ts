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

// Helper: Extraer archivo raw de diferentes estructuras de Ant Design Upload
const getRawFile = (value: any): File | undefined => {
  if (!value) return undefined;
  
  // Caso 1: Array de archivos (fileList)
  if (Array.isArray(value)) {
    // Si es un array, tomamos el último (o el primero, depende del caso de uso, para single upload solemos querer el último seleccionado)
    // Pero verifiquemos si son objetos File directamente o objetos UploadFile
    const lastItem = value[value.length - 1];
    if (lastItem instanceof File) return lastItem;
    return lastItem?.originFileObj;
  }
  
  // Caso 2: Objeto Upload change event { file, fileList }
  if (value.fileList && Array.isArray(value.fileList)) {
     const lastItem = value.fileList[value.fileList.length - 1];
     return lastItem?.originFileObj;
  }
  
  // Caso 3: Objeto directo (single file o wrapping)
  if (value.originFileObj) return value.originFileObj;
  if (value instanceof File) return value;
  
  // Caso 4: value.file (estructura a veces vista)
  if (value.file?.originFileObj) return value.file.originFileObj;

  return undefined;
};

// Helper: Detectar si hay imágenes para subir
const hasImageUpload = (variables: any): boolean => {
  return (
    !!getRawFile(variables?.images) ||
    !!getRawFile(variables?.image) || // Support singular 'image'
    !!getRawFile(variables?.images?.opengraph) ||
    !!getRawFile(variables?.images?.portada)
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

    console.log("Create variables raw:", typedVars);

    // Manejo especial de imágenes
    if (hasImageUpload(typedVars)) {
      // 1. Singular 'image' field (Cars, Promotions)
      const singularImage = getRawFile(typedVars.image);
      if (singularImage) {
        const formData = new FormData();
        formData.append("file", singularImage);
        try {
            const uploaded = await uploadImage(formData);
            if (uploaded && uploaded.id) {
                finalVariables.image_id = uploaded.id;
            } else {
                console.error("Upload failed or returned no ID", uploaded);
            }
        } catch (error) {
            console.error("Error uploading singular image", error);
        }
        delete finalVariables.image;
      }

      // 2. 'images' field (Images resource, potentially multiple but handled as single for convenience if needed, 
      // or specific structure for others)
      // NOTE: The previous code handled 'images.rawFile' which is not standard. 
      // We will check for generic 'images' upload.
      const genericImages = getRawFile(typedVars.images);
      
      if (genericImages) {
          const formData = new FormData();
          formData.append("file", genericImages);
          const uploaded = await uploadImage(formData);
          finalVariables.image_id = uploaded.id;
          // If this was an 'Images' resource create, it might just need the ID or might be fine.
          // However, 'Images' resource usually creates an image DIRECTLY. 
          // If resource === 'images', we might be uploading twice if we don't watch out.
          // But 'uploadImage' hits /images POST. 'create' hits /images POST.
          // If resource is 'images', we should probably NOT call uploadImage helper separately blindly?
          // Actually, if resource is 'images', the 'create' CALL IS the upload.
          // But let's assume valid Refine pattern: Upload to storage -> Get ID -> Create record with ID.
          // If the API for 'POST /images' just takes a file and returns the image object, then for 'images' resource 
          // we should Construct the FormData here and send it as the body of the Main Request, OR rely on the helper 
          // and let the main request just attach metadata if needed.
          
          // Current observation: 'Images' resource create just sends a file.
      }
      
      if (resource === 'images' && typedVars.images) {
          // Special handling for Images resource creation to avoid double upload or wrong payload
          // If we already uploaded above (genericImages), we have an ID.
          // If the API expects Multipart for POST /images, we should handle it here.
          // But previous code used JSON body for everything.
          // Let's assume standard flow: Upload file -> get ID -> Create record?
          // OR: POST /images IS the creation.
          
          // Let's look at previous implementation:
          // It uploaded, got ID, then POST /images with { image_id: ... }. 
          // This implies POST /images can take JSON to "register" or "update" metadata? 
          // Or maybe we are creating a duplicate entry?
          // Let's stick to the pattern: Upload -> assign image_id -> continue.
      }
      
      // 3. Nested specific fields (opengraph, portada)
      const opengraphFile = getRawFile(typedVars.images?.opengraph);
      if (opengraphFile) {
        const formData = new FormData();
        formData.append("file", opengraphFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "opengraph";
      }

      const portadaFile = getRawFile(typedVars.images?.portada);
      if (portadaFile) {
        const formData = new FormData();
        formData.append("file", portadaFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "portada";
      }

      // Cleanup
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
    
    console.log("Update into", resource, id, typedVars);

    // Manejo especial de imágenes (similar a create)
    if (hasImageUpload(typedVars)) {
      
      // 1. Singular 'image'
      const singularImage = getRawFile(typedVars.image);
      if (singularImage) {
          const formData = new FormData();
          formData.append("file", singularImage);
          try {
            const uploaded = await uploadImage(formData);
            finalVariables.image_id = uploaded.id;
          } catch(e) {
              console.error("Update upload failed", e);
          }
          delete finalVariables.image;
      }

      // 2. Nested specific fields
      const opengraphFile = getRawFile(typedVars.images?.opengraph);
      if (opengraphFile) {
        const formData = new FormData();
        formData.append("file", opengraphFile);
        const uploaded = await uploadImage(formData);
        finalVariables.image_id = uploaded.id;
        finalVariables.reftype = "opengraph";
      } 
      
      const portadaFile = getRawFile(typedVars.images?.portada);
      if (portadaFile) {
        const formData = new FormData();
        formData.append("file", portadaFile);
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

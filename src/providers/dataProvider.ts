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
    logo?: {
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
    !!getRawFile(variables?.images?.portada) ||
    !!getRawFile(variables?.images?.logo)
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
            // Check if it's a LogicalFilter (has field)
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
      const imageUpdates = [];

      // 1. Singular 'image' field (Cars, Promotions)
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
      
      // 2. Nested specific fields (opengraph, portada, logo)
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
        // Backwards compatibility
        finalVariables.image_id = imageUpdates[imageUpdates.length - 1].image_id;
        finalVariables.reftype = imageUpdates[imageUpdates.length - 1].reftype;
      }

      // Cleanup
      delete finalVariables.images;
    }

    // Special handling for 'images' resource
    if (resource === 'images') {
        const imagesField = typedVars.images;
        let filesToUpload: File[] = [];

        // Extract files
        if (Array.isArray(imagesField)) {
             // It's a fileList from Antd
             filesToUpload = imagesField.map((f: any) => f.originFileObj || f).filter(f => f instanceof File);
        } else if (imagesField && imagesField.fileList) {
             filesToUpload = imagesField.fileList.map((f: any) => f.originFileObj).filter((f: any) => f instanceof File);
        } else if (imagesField instanceof File) {
             filesToUpload = [imagesField];
        }

        if (filesToUpload.length === 0) {
            console.warn("No files found for image upload");
             // Fallback or error? Let's try to proceed to avoid total block, but likely will fail.
        }

        let lastResult: any = {};
        
        // Upload each file
        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append("file", file);
            
            try {
                // 1. Upload
                const uploaded = await uploadImage(formData);
                lastResult = uploaded;
                
                // 2. Update metadata (reftype) if present
                if (typedVars.reftype) {
                    await fetch(`${API_URL}/images/${uploaded.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reftype: typedVars.reftype })
                    });
                     // Merge reftype into result for frontend consistency
                    lastResult = { ...lastResult, reftype: typedVars.reftype };
                }
            } catch (err) {
                console.error("Error uploading file in images resource", err);
                throw err;
            }
        }
        
        // Return the last uploaded item as the result (Refine create expects single)
        // Ideally we shouldn't support multiple in Create if we can only return one, 
        // but this stops the crash.
        return { data: lastResult };
    }

    // Standard JSON Create for other resources
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
    // EXCEPTION: If resource is 'images', we want to REPLACE the file, not create a new one and link ID.
    if (resource === 'images') {
        const file = getRawFile(typedVars.image);
        if (file) {
             const formData = new FormData();
             formData.append("file", file);
             if (typedVars.reftype) {
                 formData.append("reftype", typedVars.reftype);
             }
             
             const response = await fetch(`${API_URL}/images/${id}`, {
                 method: 'PATCH',
                 body: formData
             });
             
             const data = await response.json();
             return { data };
        }
    }

    if (hasImageUpload(typedVars) && resource !== 'images') {
      const imageUpdates = [];
      
      // 1. Singular 'image'
      const singularImage = getRawFile(typedVars.image);
      if (singularImage) {
          const formData = new FormData();
          formData.append("file", singularImage);
          try {
            const uploaded = await uploadImage(formData);
            finalVariables.image_id = uploaded.id;
            finalVariables.image = uploaded.id;
          } catch(e) {
              console.error("Update upload failed", e);
          }
      }

      // 2. Nested specific fields
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
        // Backwards compatibility
        finalVariables.image_id = imageUpdates[imageUpdates.length - 1].image_id;
        finalVariables.reftype = imageUpdates[imageUpdates.length - 1].reftype;
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

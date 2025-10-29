export type ImageItem = {
    id: string;
    dataUrl: string;
    order: number;
    rotation?: number;
  };
  
  export type Folder = {
    id: string;
    name: string;
    createdAt: string;
    images: ImageItem[];
  };
  
  export type PDFMeta = {
    id: string;
    folderId: string;
    generatedAt: string;
  };
  
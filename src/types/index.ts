// src/types/index.ts

export interface ImageItem {
  id: string;              // unique ID for each uploaded image
  fileData: string;        // base64 image data (after compression)
  order: number;           // order in the test
}

export interface TestFile {
  id: string;              // unique ID for the test
  name: string;            // test name entered by user
  folderId: string;        // link to parent folder
  images: ImageItem[];     // images belonging to the test
  createdAt: Date;         // timestamp of creation
  updatedAt: Date;         // last modification timestamp
}

export interface Folder {
  id: string;              // unique folder ID
  name: string;            // folder name
  createdAt: Date;         // creation date
  tests: TestFile[];       // tests inside this folder
}

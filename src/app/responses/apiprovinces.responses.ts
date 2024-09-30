// src/app/interfaces/global-interfaces.ts

export interface ApiResponsePro<T> {
    error: number;
    error_text: string;
    data_name: string;
    data: T[];
  }
  
  export interface Province {
    id: string;
    full_name: string;
  }
  
  export interface District {
    id: string;
    full_name: string;
  }
  
  export interface Ward {
    id: string;
    full_name: string;
  }
  
// types/googleTypes.ts
export interface GooglePlacePhoto {
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }
  
  export interface GooglePlaceResult {
    formatted_address: string;
    name: string;
    photos?: GooglePlacePhoto[];
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: {
      weekday_text?: string[];
    };
  }
  
  export interface GooglePlaceResponse {
    html_attributions: string[];
    result: GooglePlaceResult;
    status: string;
    error_message?: string;
  }
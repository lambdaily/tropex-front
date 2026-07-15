export type DocumentType = 'cedula' | 'ruc' | 'senacsa' | 'access_map' | 'vehicle_photo';

export interface PresignedUrlResponse {
  upload_url: string;
  object_key: string;
  public_url: string;
  expires_in: number;
}

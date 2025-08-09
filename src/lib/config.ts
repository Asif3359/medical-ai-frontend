export const API_BASE_URL = "https://medicale-ai-backend.onrender.com";

export const STORAGE_KEYS = {
  accessToken: "medical_ai_access_token",
  tokenType: "medical_ai_token_type",
  userEmail: "medical_ai_user_email",
  userName: "medical_ai_user_name",
  history: "medical_ai_prediction_history",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// If your backend exposes a prediction image endpoint, update the template below.
// The placeholder {id} will be replaced with the prediction_id
export const PREDICTION_IMAGE_URL_TEMPLATE = `${API_BASE_URL}/predictions/{id}/image`;



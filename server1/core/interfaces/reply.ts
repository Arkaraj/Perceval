export interface IReply {
  200: { success: true; message: string; data?: any[] };
  '4xx': { success: boolean; error: string; message: string };
  '5xx': { success: false; message: string };
}

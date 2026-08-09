import { apiClient, getApiErrorMessage } from './client'

export interface UploadedImage {
  url: string
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<{ success: true; data: UploadedImage }>(
      '/uploads/avatar',
      formData,
      { headers: { 'Content-Type': undefined } },
    )
    return res.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not upload the image.'), { cause: error })
  }
}

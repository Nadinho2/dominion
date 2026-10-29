import { createClient } from './client';

export const BUCKETS = {
  AVATARS: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS || 'student-avatars',
  REPORTS: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_REPORTS || 'report-cards',
  RECEIPTS: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_RECEIPTS || 'bursary-receipts'
};

export async function uploadStudentAvatar(file: File, admissionNo: string): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${admissionNo.replace(/\//g, '_')}_${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from(BUCKETS.AVATARS).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadReportCard(pdfBlob: Blob, reportFileName: string): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const filePath = `reports/${reportFileName}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKETS.REPORTS)
    .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: true });

  if (error) {
    console.error('Report card upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKETS.REPORTS).getPublicUrl(filePath);
  return data.publicUrl;
}


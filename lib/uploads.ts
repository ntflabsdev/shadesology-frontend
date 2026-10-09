export interface PolicyBoundUpload {
  uploadUrl: string;
  fields: Record<string, string>;
}

export function uploadFileWithPostPolicy(upload: PolicyBoundUpload, file: File) {
  const body = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) {
    body.append(name, value);
  }
  body.append("file", file);

  return fetch(upload.uploadUrl, { method: "POST", body });
}

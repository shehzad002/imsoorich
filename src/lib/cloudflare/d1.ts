import {
  getCloudflareAccountId,
  getCloudflareApiToken,
  getD1DatabaseId,
} from "@/lib/cloudflare/config";

type D1Response<T> = {
  success: boolean;
  errors?: { message: string }[];
  result?: { results: T[] }[];
};

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${getCloudflareAccountId()}/d1/database/${getD1DatabaseId()}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCloudflareApiToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const json = (await res.json()) as D1Response<T>;

  if (!json.success) {
    const msg = json.errors?.[0]?.message || `D1 query failed (${res.status})`;
    throw new Error(msg);
  }

  return json.result?.[0]?.results ?? [];
}

export async function d1Execute(sql: string, params: unknown[] = []) {
  await d1Query(sql, params);
}

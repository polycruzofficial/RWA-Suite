const PINATA_JWT = process.env.PINATA_JWT || "";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append("pinataMetadata", metadata);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`IPFS upload failed: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash;
}

export async function uploadJSONToIPFS(json: Record<string, unknown>, name: string): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name },
    }),
  });

  if (!res.ok) throw new Error(`IPFS JSON upload failed: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash;
}

export function getIPFSUrl(hash: string): string {
  if (!hash) return "";
  return `${PINATA_GATEWAY}/${hash}`;
}

export async function fetchFromIPFS<T = unknown>(hash: string): Promise<T> {
  const res = await fetch(getIPFSUrl(hash));
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  return res.json();
}

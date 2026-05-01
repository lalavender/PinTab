const default_svg = "/default-icon.svg";

const _browserRelatedHeaders: Record<string, string> = {
  "sec-ch-ua":
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "sec-ch-ua-arch": "x86",
  "sec-ch-ua-bitness": "64",
  "sec-ch-ua-full-version": "131.0.6778.69",
  "sec-ch-ua-full-version-list":
    '"Google Chrome";v="131.0.6778.69", "Chromium";v="131.0.6778.69", "Not_A Brand";v="24.0.0.0"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-model": "",
  "sec-ch-ua-platform": "Windows",
  "sec-ch-ua-platform-version": "15.0.0",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

let _defaultImageData: ImageData | undefined;

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 3000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(id);
      return response;
    })
    .catch((error) => {
      clearTimeout(id);
      if (error.name === "AbortError") throw new Error("Request timeout");
      throw error;
    });
}

import { convertBlobToBase64 } from "./imageUtils";

function isImageBlob(blob: Blob, url: string, arrtype?: string[]): boolean {
  if (!blob) return false;
  const type = blob.type;
  if (type === "application/octet-stream" && url && arrtype) {
    return arrtype.some((item) => url.endsWith(`.${item}`));
  }
  return /^image\//.test(type);
}

async function fetchFaviconBlobData(
  url: string,
  iconLinks: string[],
): Promise<{ blob: Blob | null; faviconUrl: string | null }> {
  try {
    let faviconUrl: string | null = null;
    let blob: Blob | null = null;

    if (iconLinks.length > 0) {
      for (const href of iconLinks) {
        faviconUrl = href.startsWith("http") ? href : new URL(href, url).href;
        const iconResponse = await fetch(faviconUrl, {
          headers: _browserRelatedHeaders,
        });
        if (iconResponse.status === 200) {
          blob = await iconResponse.blob();
          break;
        }
      }
    } else {
      faviconUrl = new URL("/favicon.ico", url).href;
      const iconResponse = await fetch(faviconUrl, {
        headers: _browserRelatedHeaders,
      });
      if (iconResponse.status === 200) {
        blob = await iconResponse.blob();
      }
    }

    return { blob, faviconUrl };
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return { blob: null, faviconUrl: null };
  }
}

export async function fetchFaviconAsBase64(
  url: string,
): Promise<{ base64: string | null; title: string } | null> {
  try {
    if (!isValidUrl(url)) return null;

    const response = await fetchWithTimeout(
      url,
      { headers: _browserRelatedHeaders },
      5000,
    );
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const iconLinks = Array.from(doc.querySelectorAll("link"))
      .filter((link) => link.getAttribute("rel")?.includes("icon"))
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => href !== null);

    const { blob, faviconUrl } = await fetchFaviconBlobData(url, iconLinks);

    if (blob && isImageBlob(blob, faviconUrl || "", ["ico"])) {
      const base64 = await convertBlobToBase64(blob);
      return { base64, title: doc.title };
    } else {
      return { base64: null, title: doc.title };
    }
  } catch {
    return null;
  }
}

export function getFaviconURL(pageUrl: string, size = 128): string {
  try {
    const urlObj = new URL(pageUrl);
    const hostname = urlObj.hostname;
    // Primary: Google's high-res favicon service
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
  } catch (e) {
    // Fallback to Chrome's built-in favicon API if URL parsing fails
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", pageUrl);
    url.searchParams.set("size", String(size));
    return url.toString();
  }
}


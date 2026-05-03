export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PinCraft/1.0; +https://pincraft-eta.vercel.app)",
        "Accept": "text/html",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return `[Could not fetch website: HTTP ${res.status}]`;

    const html = await res.text();

    // Extract useful text content from HTML
    let text = html
      // Remove script, style, svg, noscript blocks
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      // Extract title
      .replace(/<title>(.*?)<\/title>/i, "\n[PAGE TITLE: $1]\n")
      // Extract meta description
      .replace(
        /<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["'](.*?)["']/gi,
        "\n[META DESCRIPTION: $1]\n"
      )
      // Extract headings
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n[HEADING: $1]\n")
      // Extract link text
      .replace(/<a[^>]*>(.*?)<\/a>/gi, " $1 ")
      // Extract alt text from images
      .replace(/<img[^>]*alt=["'](.*?)["'][^>]*>/gi, "\n[IMAGE: $1]\n")
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode common HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Limit to ~3000 chars to avoid token overload
    if (text.length > 3000) {
      text = text.slice(0, 3000) + "...";
    }

    return text || "[Website returned empty content]";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return "[Website took too long to respond]";
    }
    return `[Could not access website: ${err instanceof Error ? err.message : "unknown error"}]`;
  }
}

const PINTEREST_API_BASE = "https://api.pinterest.com/v5";
const PINTEREST_OAUTH_URL = "https://www.pinterest.com/oauth/";
const PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token";

const REQUIRED_SCOPES = [
  "user_accounts:read",
  "boards:read",
  "boards:write",
  "pins:read",
  "pins:write",
];

export function buildAuthUrl(appId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: REQUIRED_SCOPES.join(","),
    state,
  });
  return `${PINTEREST_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  appId: string,
  appSecret: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  scope: string;
}> {
  const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  const response = await fetch(PINTEREST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest token exchange failed: ${response.status} ${errText}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
  appId: string,
  appSecret: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  scope: string;
}> {
  const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  const response = await fetch(PINTEREST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest token refresh failed: ${response.status} ${errText}`);
  }

  return response.json();
}

export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pin_count: number;
  privacy: string;
}

export async function listBoards(accessToken: string): Promise<PinterestBoard[]> {
  const boards: PinterestBoard[] = [];
  let bookmark: string | null = null;

  do {
    const url = new URL(`${PINTEREST_API_BASE}/boards`);
    url.searchParams.set("page_size", "100");
    if (bookmark) url.searchParams.set("bookmark", bookmark);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinterest list boards failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    boards.push(...(data.items ?? []));
    bookmark = data.bookmark ?? null;
  } while (bookmark);

  return boards;
}

export async function createBoard(
  accessToken: string,
  name: string,
  description: string
): Promise<PinterestBoard> {
  const response = await fetch(`${PINTEREST_API_BASE}/boards`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description, privacy: "PUBLIC" }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest create board failed: ${response.status} ${errText}`);
  }

  return response.json();
}

export interface CreatePinOptions {
  boardId: string;
  title: string;
  description: string;
  link?: string;
  imageBase64?: string;
  imageUrl?: string;
  altText?: string;
}

export async function createPin(
  accessToken: string,
  options: CreatePinOptions
): Promise<{ id: string; [key: string]: unknown }> {
  let mediaSource: Record<string, string>;

  if (options.imageBase64) {
    const base64Data = options.imageBase64.replace(/^data:[^;]+;base64,/, "");
    mediaSource = {
      source_type: "image_base64",
      content_type: "image/png",
      data: base64Data,
    };
  } else if (options.imageUrl) {
    mediaSource = {
      source_type: "image_url",
      url: options.imageUrl,
    };
  } else {
    throw new Error("Either imageBase64 or imageUrl is required");
  }

  const body: Record<string, unknown> = {
    board_id: options.boardId,
    title: options.title.slice(0, 100),
    description: options.description.slice(0, 800),
    media_source: mediaSource,
  };

  if (options.link) body.link = options.link;
  if (options.altText) body.alt_text = options.altText;

  const response = await fetch(`${PINTEREST_API_BASE}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest create pin failed: ${response.status} ${errText}`);
  }

  return response.json();
}

export async function getUserAccount(accessToken: string): Promise<{
  username: string;
  profile_image: string;
  account_type: string;
}> {
  const response = await fetch(`${PINTEREST_API_BASE}/user_account`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest user account failed: ${response.status} ${errText}`);
  }

  return response.json();
}

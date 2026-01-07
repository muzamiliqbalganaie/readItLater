export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // If OAuth is not configured, return a placeholder
  if (!oauthPortalUrl || !appId) {
    console.warn(
      "OAuth not configured. Set VITE_OAUTH_PORTAL_URL and VITE_APP_ID in .env file."
    );
    return "#"; // Return a safe fallback URL
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Use Auth0's /authorize endpoint
  const url = new URL(`${oauthPortalUrl}/authorize`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");

  return url.toString();
};

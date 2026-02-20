"use client";

/**
 * Save token safely
 */
export function setToken(
  token: string
) {

  if (
    typeof window !==
    "undefined"
  ) {

    localStorage.setItem(
      "token",
      token
    );

    document.cookie =
      `token=${token}; path=/; max-age=604800`;

  }

}

/**
 * Get token safely
 */
export function getToken():
  | string
  | null {

  if (
    typeof window ===
    "undefined"
  )
    return null;

  return localStorage.getItem(
    "token"
  );

}

/**
 * Remove token safely
 */
export function removeToken() {

  if (
    typeof window !==
    "undefined"
  ) {

    localStorage.removeItem(
      "token"
    );

    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

  }

}

/**
 * Check login state safely
 */
export function isLoggedIn():
  boolean {

  if (
    typeof window ===
    "undefined"
  )
    return false;

  return !!localStorage.getItem(
    "token"
  );

}

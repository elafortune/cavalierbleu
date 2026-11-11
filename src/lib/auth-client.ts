"use client";

import { createAuthClient } from "better-auth/react";

// Même origine que la page : pas besoin de baseURL.
export const authClient = createAuthClient();

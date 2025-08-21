export async function verifyToken() {
  try {
    const res = await fetch("https://tasklytic-1.onrender.com/api/users/verify-token", {
      method: "GET",
      credentials: "include", //  since using isAuthenticated (likely cookie/session based)
    });

    if (res.ok) {
      const data = await res.json();
      // Optionally store user role/email from backend instead of localStorage only
      localStorage.setItem("role", data.user.role);
      return true;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      return false;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    return false;
  }
}

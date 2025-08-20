export async function verifyToken() {
  try {
    const res = await fetch("/api/verify-token", {
      method: "GET",
      credentials: "include" // send cookies with request
    });

    if (res.ok) {
      return true; // token valid
    } else {
      localStorage.removeItem("token"); 
      localStorage.removeItem('user');
      localStorage.removeItem("role");
      return false;
    }
  } catch {
    localStorage.removeItem("token"); 
      localStorage.removeItem('user');
      localStorage.removeItem("role");
    return false;
  }
}

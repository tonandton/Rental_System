export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (err) {
    return true;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // ถ้ามี
}

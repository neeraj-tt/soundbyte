export default function AuthButton({ isAuthenticated }) {
  const backendUrl = "http://localhost:8888";

  const handleLogin = () => {
    window.location.href = `${backendUrl}/login`;
  };

  const handleLogout = () => {
    // Remove stored Spotify tokens
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiration");
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_refresh_token");
    sessionStorage.removeItem("spotify_token_expiration");

    //Navigate to login
    window.location.href = "/";
  };

  return isAuthenticated ? (
    <button
      onClick={handleLogout}
      className="text-black bg-white hover:bg-red-500 hover:text-white transition focus:outline-none focus:ring-4 
                 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 
                 absolute top-4 right-4"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={handleLogin}
      className="mt-8 text-black bg-green-500 hover:bg-white focus:outline-none focus:ring-4 
                      focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
    >
      Log in with Spotify
    </button>
  );
}

const isRefreshTokenValid = () => {
    const token = localStorage.getItem('refresh_token');
    if (!token) return false;

    const expiry = localStorage.getItem('refresh_token_expiry');
    if (!expiry) return false;
    if (Date.now() > parseInt(expiry, 10)) {
        // Token expired, remove from localStorage if necessary
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('refresh_token_expiry');
        return false;
    }
    return true;
};


export default isRefreshTokenValid;
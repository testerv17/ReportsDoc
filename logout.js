function logout() {
    localStorage.removeItem('rol');
    window.location.href = 'login.html';
  }
  
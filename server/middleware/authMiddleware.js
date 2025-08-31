export function redirectIfLoggedIn(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    // Already logged in → redirect to admin
    return res.redirect("/admin");
  } else if (req.session.user && req.session.user.isAdmin === false) {
    // Already logged in as user → redirect to user dashboard
    return res.redirect("/home");
  }
  next(); // Not logged in → continue to login page
}

export function requireAdminLogin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/login"); // Not logged in → send to login
  }
  next(); // Logged in → continue
}

export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login"); // Not logged in → send to login
  }
  next(); // Logged in → continue
}

export default { redirectIfLoggedIn, requireLogin, requireAdminLogin};
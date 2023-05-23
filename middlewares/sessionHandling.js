export function isLoggedIn(req, res, next) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
}

export function isloggedInUser(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
}

export function isloggedInadmin(req, res, next) {
  
    if (req.session.admin) {
      next();
    } else {
      res.redirect('/admin/login');
    }
}





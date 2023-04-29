
// export function isLoggedIn(req, res, next) {
//     if (req.session.loggedIn) {
//       res.redirect("/");
//     } else {
//       next();
//     }
//   }
//   export function isUser(req, res, next) {
//     if (req.session.loggedIn) {
//       next();
//     } else {
//       res.redirect("/");
//     }
//   }

export function isloggedInadmin(req, res, next) {
  
    if (req.session.admin) {
      next();
    } else {
      res.redirect('/admin/login');
    }
}

// export function islogged(req, res, next) {
  
//   if (req.session.admin=false) {
//     next();
//   } else {
//     res.redirect('/admin');
//   }
// }



const sanitize = (str) =>
  typeof str === "string"
    ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()
    : str;

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2)
    return res.status(400).json({ status: false, message: "Нэр хамгийн багадаа 2 тэмдэгт байх ёстой" });
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ status: false, message: "И-мэйл хаяг буруу байна" });
  if (!password || password.length < 6)
    return res.status(400).json({ status: false, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" });
  req.body.name = sanitize(name);
  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ status: false, message: "И-мэйл хаяг шаардлагатай" });
  if (!password)
    return res.status(400).json({ status: false, message: "Нууц үг шаардлагатай" });
  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateTodo = (req, res, next) => {
  const { title, status, priority } = req.body;
  if (!title || title.trim().length < 1)
    return res.status(400).json({ status: false, message: "Гарчиг шаардлагатай" });
  const validStatus = ["todo", "in_progress", "completed"];
  if (status && !validStatus.includes(status))
    return res.status(400).json({ status: false, message: "Status буруу байна" });
  const validPriority = ["low", "medium", "high"];
  if (priority && !validPriority.includes(priority))
    return res.status(400).json({ status: false, message: "Priority буруу байна" });
  req.body.title = sanitize(title);
  if (req.body.description) req.body.description = sanitize(req.body.description);
  next();
};

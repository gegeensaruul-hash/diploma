export const routeNotFound = (req, res, next) => {
  const error = new Error(`Route олдсонгүй: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  res.status(statusCode).json({ status: false, message });
};

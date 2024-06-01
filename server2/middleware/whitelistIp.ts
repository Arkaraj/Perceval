import { Request, Response, NextFunction } from 'express';

export const whiteListIps = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // whitelist server1 ip
  const validIps = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];

  if (validIps.includes(req.socket.remoteAddress || '')) {
    next();
  } else {
    const err = new Error('Bad IP: ' + req.socket.remoteAddress);
    next(err);
  }
};

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface TokenI {
  clienteLogadoId: string;
  clienteLogadoNome: string;
}

export function verificaToken(req: Request & { clienteLogadoId?: string, clienteLogadoNome?: string }, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token não informado" });
  }

  const parts = authorization.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY as string) as TokenI;
    req.clienteLogadoId = decoded.clienteLogadoId;
    req.clienteLogadoNome = decoded.clienteLogadoNome;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

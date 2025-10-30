import { AlimentosItf } from "./AlimentosItf";

export interface DispensaItf {
  id: string;
  nome: string;
  usuarioID: string;
  createdAt: string; // corrigido
  alimentos: AlimentosItf[];
}

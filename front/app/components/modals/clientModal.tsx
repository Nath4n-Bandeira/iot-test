'use client';

import { useState } from 'react';
import Modal from './modal';
import { DispensaItf } from '@/app/utils/types/DispensaItf';

import { set, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useClienteStore } from '@/app/context/ClienteContext';
import { useRouter } from 'next/navigation';


type inputs = 
{ nome: string, 
  usuarioID: string 
};


export default function ClientModal({ usuarioID }: { usuarioID: string }) {
  const {cliente} = useClienteStore();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm<DispensaItf>();
  const router = useRouter();

  async function tryinput(data: inputs) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: data.nome,
        usuarioID: usuarioID,
      }),
    }
  );
  setIsOpen(false);
  window.location.reload();
  
} catch (error) {
  console.error("Erro de rede ou outra falha:", error);
}
}
 
  return (
    <>
      <button className="px-4 py-2 bg-[#2c2c2c] text-[#ffffff] rounded-md hover:bg-[#1e1e1e] font-medium"onClick={() => setIsOpen(true)}>Criar sua Dispensa</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        
        <form action="" onSubmit={handleSubmit(tryinput)} >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome da dispensa
          </label>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            {...register("nome")}/>
         </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Criar Dispensa
        </button>
        </form>
      </Modal>
    </>
  );
}

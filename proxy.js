import { NextResponse } from "next/server";

// Nesta branch de testes as rotas continuam acessíveis sem sessão, para
// permitir revisar as telas enquanto a API de autenticação não está disponível.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*"],
};

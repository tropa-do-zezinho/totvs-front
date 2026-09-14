# TOTVS Front

Frontend Next.js para autenticação, envio de arquivos e consulta dos insights produzidos pelo Worker.

## Desenvolvimento

Use Node.js 24 e execute `npm ci` e `npm run dev`. A API Spring deve estar em `http://localhost:8080`. Se estiver em outro endereço, defina `API_BASE_URL` no ambiente do processo Next.js.

O navegador chama apenas as rotas `/api/*` do próprio frontend. O servidor Next encaminha as requisições à API e guarda o JWT em cookie HttpOnly. Não é necessário configurar CORS nem expor o token em JavaScript.

## Fluxo implementado

- `POST /api/auth/register` e `POST /api/auth/login`: recebem o JWT da API e criam a sessão.
- `POST /api/blobs`: envia CSV, JSON ou JSONL (máximo de 50 MB).
- `GET /api/blobs`: lista uploads e permite acompanhar `criado`, `analisando`, `processado` e `falha`.
- `GET /api/insights/{requestId}`: mostra o resumo e as reuniões após o processamento.
- `POST /api/auth/logout`: encerra a sessão local.

O status é consultado periodicamente porque a API ainda não expõe um canal de eventos para esse fluxo. A API atual não implementa 2FA, compartilhamento de relatórios ou exportações PDF/XLSX; essas ações não aparecem como disponíveis no frontend.

## Validação

```bash
npm run lint
npm run build
```

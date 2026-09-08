# Challenge TOTVS 2026 Frontend

Interface web da plataforma de Inteligência Conversacional. O frontend recebe transcrições, acompanha o processamento assíncrono e apresenta insights, downloads e compartilhamento de relatórios.

## Requisitos

- Node.js 20 ou superior
- API principal em execução (por padrão, `http://localhost:8080`)

## Executar localmente

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Variáveis de ambiente

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base da API REST |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/ws` | Base do WebSocket de status |

## Comandos

```bash
npm run dev    # servidor de desenvolvimento
npm run lint   # análise estática
npm run build  # build de produção
npm run start  # executa o build de produção
```

## Integração esperada

A API deve aceitar requisições do frontend em `http://localhost:3000` com credenciais e expor login, cadastro, upload, relatórios, compartilhamento e WebSocket. O download é solicitado em `GET /reports/:id/download?type=pdf|xlsx`; a resposta deve fornecer uma URL SAS temporária em `url`, `downloadUrl` ou `sasUrl`.

Os arquivos aceitos pela interface são CSV, JSON, JSONL e XLSX. A validação estrutural da base e o contrato definitivo de `insights.json` dependem da API e do worker.

# Challenge TOTVS 2026 Frontend

Interface web da plataforma de Inteligência Conversacional. O frontend recebe transcrições, acompanha o processamento assíncrono e apresenta insights, downloads e compartilhamento de relatórios.

Este documento é o contrato prático para conectar o backend ao frontend atual. Onde uma resposta ainda não foi decidida pelo grupo, ela está marcada como pendência.

## Executar localmente

Pré-requisitos: Node.js 20+ e a API em execução.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base da API REST |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/ws` | Base do WebSocket de jobs |

```powershell
npm run lint
npm run build
```

## Regras técnicas obrigatórias para a API

- O frontend envia todas as chamadas REST com `credentials: "include"`.
- Em desenvolvimento, a API deve permitir a origem `http://localhost:3000`, o método `OPTIONS` e os métodos `GET`, `POST`, `PUT` e `DELETE`.
- Quando `credentials` é usado, `Access-Control-Allow-Origin` **não pode** ser `*`; deve ser a origem exata do frontend, e `Access-Control-Allow-Credentials` deve ser `true`.
- Após autenticação, a API deve criar o cookie `ct_session`, com `HttpOnly`, `Path=/` e um JWT válido. Em ambiente local, não usar `Secure`; em HTTPS de produção, usar `Secure`.
- Em caso de erro, devolver JSON no formato `{ "message": "Mensagem para o usuário" }`. O frontend exibe esse campo diretamente.
- Respostas sem corpo devem usar HTTP `204`. As demais respostas devem ser JSON.

## Autenticação atual — TOTP

> Importante: o frontend **atualmente usa TOTP por QR Code** (Google Authenticator, Microsoft Authenticator ou Authy). Não implemente OTP por e-mail nestes endpoints sem antes alterar o frontend.

| Método | Endpoint | Corpo recebido pela API | Resposta esperada pelo frontend |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ "name", "email", "password" }` | `201`/`200`. Em seguida o frontend abre a configuração TOTP. |
| `POST` | `/auth/2fa/setup` | Sem corpo; usuário recém-cadastrado deve estar identificado pela sessão/cookie. | `{ "qrCodeDataUrl": "data:image/..." }` |
| `POST` | `/auth/login` | `{ "email", "password" }` | Se TOTP for exigido: `{ "challengeToken": "..." }`. Se não for: criar `ct_session` e responder `200`. |
| `POST` | `/auth/2fa/verify` | `{ "challengeToken": "...", "code": "123456" }`. Na etapa de setup, `challengeToken` pode não existir. | Criar `ct_session` e responder `200`/`204`. |
| `POST` | `/auth/logout` | Sem corpo | Limpar `ct_session`; responder `204` ou JSON. |
| `GET` | `/auth/me` | Sem corpo | Dados do usuário autenticado. |

Validações esperadas: e-mail único, senha com mínimo de 8 caracteres e código TOTP de seis dígitos. O `challengeToken` é transportado apenas na URL da tela de 2FA e deve expirar rapidamente.

## Upload e processamento

O frontend aceita `.csv`, `.json`, `.jsonl` e `.xlsx`. A API continua sendo responsável por validar conteúdo, tamanho, estrutura e permissão.

| Método | Endpoint | Corpo recebido pela API | Resposta esperada |
| --- | --- | --- | --- |
| `POST` | `/reports` | `multipart/form-data`, campo obrigatório `file` | `{ "jobId": "uuid" }` |

Após receber `jobId`, o frontend abre o WebSocket abaixo e exibe o progresso.

### WebSocket de status

Conexão: `ws://localhost:8080/ws/jobs/{jobId}` (ou a base definida em `NEXT_PUBLIC_WS_URL`).

Cada mensagem deve ser JSON:

```json
{
  "stage": "processing",
  "updatedAt": "2026-09-08T15:30:00Z",
  "message": "Opcional; obrigatório quando houver falha"
}
```

Estados preferenciais: `pending`, `queued`, `processing`, `completed`, `failed`. O frontend ainda aceita os nomes legados `received`, `done` e `error` durante a transição.

## Relatórios e dashboard

### Lista

`GET /reports` deve retornar uma lista de relatórios próprios e compartilhados:

```json
[
  {
    "id": "uuid",
    "fileName": "reuniao-cliente.json",
    "createdAt": "2026-09-08T15:30:00Z",
    "stage": "completed"
  }
]
```

### Detalhe

`GET /reports/{reportId}` deve retornar ao menos:

```json
{
  "id": "uuid",
  "fileName": "reuniao-cliente.json",
  "stage": "completed",
  "insights": {
    "stats": [{ "label": "Score de churn", "value": "82", "hint": "Alto" }],
    "charts": [
      {
        "title": "Prioridade por reunião",
        "type": "bar",
        "accent": "#00dbff",
        "data": [{ "label": "Reunião A", "value": 82 }]
      }
    ]
  },
  "sharedWith": [{ "id": "uuid", "identifier": "pessoa@empresa.com" }]
}
```

O contrato definitivo de `insights` ainda deve ser fechado com o time do worker. Enquanto isso, `stats` e `charts` podem ser listas vazias.

## Download seguro

Os botões só ficam ativos quando `stage` é `completed` (ou `done`, durante a transição).

| Método | Endpoint | Resposta esperada |
| --- | --- | --- |
| `GET` | `/reports/{reportId}/download?type=pdf` | `{ "url": "https://...SAS..." }` |
| `GET` | `/reports/{reportId}/download?type=xlsx` | `{ "url": "https://...SAS..." }` |

Também são aceitos temporariamente os campos `downloadUrl` ou `sasUrl` no lugar de `url`. A API deve validar se o usuário é dono ou recebeu compartilhamento antes de gerar a URL assinada.

## Compartilhamento

| Método | Endpoint | Corpo | Resposta esperada |
| --- | --- | --- | --- |
| `POST` | `/reports/{reportId}/share` | `{ "identifier": "email-ou-usuario" }` | `{ "id": "uuid", "identifier": "pessoa@empresa.com" }` |

O backend deve bloquear compartilhamento duplicado e acesso de usuários que não sejam o dono ou destinatário do compartilhamento.

## Checklist para integração

1. Configurar CORS e cookie `ct_session`.
2. Implementar os endpoints de autenticação TOTP da tabela acima.
3. Subir `POST /reports` retornando um `jobId` real.
4. Publicar mensagens WebSocket no caminho do job.
5. Entregar `GET /reports` e `GET /reports/{id}` com os campos documentados.
6. Implementar geração de SAS para PDF/XLSX e compartilhamento.
7. Validar o fluxo: cadastro → QR Code → TOTP → login → upload → status → dashboard → download → compartilhamento.

## Pendências que precisam de decisão do grupo

- Contrato completo de `insights.json` do worker.
- Limite máximo de tamanho e estrutura aceita para cada tipo de upload.
- Se o 2FA permanecerá TOTP ou será migrado para OTP por e-mail. Hoje, o frontend está em TOTP.
- Endpoint de revogação de compartilhamento e paginação/filtros de relatórios.

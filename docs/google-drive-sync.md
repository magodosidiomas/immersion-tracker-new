# Google Drive Sync — Design

## Visão geral
Backup automático silencioso usando o Google Drive do próprio usuário como storage. Resolve o problema de perda de dados do Safari (IndexedDB purgado após 7 dias sem visita) e permite troca de dispositivo.

Não é sync bidirecional em tempo real — é "último backup vence", o que cobre 95% dos casos de uso.

## Autenticação
- Google Identity Services (GIS) — biblioteca moderna, sem gapi
- Escopo: `drive.appdata` — cria uma pasta oculta exclusiva do app, invisível no Drive do usuário
- Client ID via `VITE_GOOGLE_CLIENT_ID` no `.env`
- OAuth popup flow; token armazenado em memória (não em localStorage)

## Formato do arquivo no Drive
O mesmo JSON que `exportData()` já produz:
```json
{
  "version": 1,
  "exportedAt": "ISO timestamp",
  "languages": [...],
  "sessions": [...],
  "appSettings": {...}
}
```
Nome do arquivo: `imerso-backup.json` (sobrescreve sempre o mesmo arquivo, não acumula versões).

## Quando sincroniza

| Evento | Ação |
|---|---|
| Usuário finaliza sessão | Upload silencioso |
| Usuário edita/deleta sessão | Upload silencioso |
| App abre (autenticado) | Checa timestamp do Drive vs local |
| Sem autenticação | App funciona normalmente, sem bloqueio |
| Sem conexão | Silencia erros, tenta novamente na próxima oportunidade |

## Prompt de sync na abertura (estilo Anki)
Se o backup no Drive tiver `exportedAt` mais recente que o dado local → exibe banner:

> "Backup mais recente encontrado (há 2 dias). Sincronizar?"
> [Sincronizar] [Ignorar]

Se o local for mais recente → sobe silenciosamente sem prompt.
Se forem iguais → nada acontece.

## Resolução de conflito
Timestamp vence (`exportedAt`). Sem merge — o mais recente sobrescreve o mais antigo inteiro. Limitação conhecida: editar offline nos dois dispositivos ao mesmo tempo perde as mudanças do mais antigo.

## Cotas
Drive tem limite de ~1 req/seg e quota diária generosa. Sync por evento (não por intervalo) mantém uso mínimo — cada backup é alguns KB. Polling não é usado.

## Módulo planejado: `src/services/googleDrive.js`
Interface pública prevista:

```js
signIn()          // OAuth popup → salva token em memória
signOut()         // revoga token
getAuthState()    // { isSignedIn, user } — para UI condicional
saveBackup(data)  // upload do JSON exportado para appDataFolder
loadBackup()      // baixa e parseia o backup mais recente; null se não existir
```

Nenhuma tela existente precisa mudar para integrar. O ponto de entrada natural é `Backup.jsx`, que já tem export/import local — o Drive seria uma seção adicional na mesma tela.

## Dependências
Nenhuma nova biblioteca. GIS é carregado via CDN no `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
Chamadas à Drive API via `fetch` puro com o access token do GIS.

## Pré-requisitos antes de implementar
1. Criar projeto no Google Cloud Console
2. Ativar Google Drive API
3. Criar OAuth 2.0 Client ID (tipo: Web application)
4. Adicionar domínio do app como origem autorizada
5. Adicionar `VITE_GOOGLE_CLIENT_ID=...` no `.env` (e no painel do Cloudflare)

# GitHub Pages Deployment Guide

Este guia vai te ajudar a fazer o deploy do planejador GvG no GitHub Pages.

## Pré-requisitos

1. Uma conta no GitHub
2. Git instalado no seu computador
3. Node.js e npm instalados

## Opção 1: Deploy Manual com npm (Recomendado)

Esta é a forma mais simples e rápida de fazer deploy.

### Passo 1: Criar o Repositório no GitHub

1. Vá para [GitHub](https://github.com)
2. Clique no ícone "+" no canto superior direito e selecione "New repository"
3. Nome do repositório: `NGL-wwm-gvg`
4. Configure como **Public**
5. **NÃO** inicialize com README, .gitignore ou licença (já temos esses arquivos)
6. Clique em "Create repository"

### Passo 2: Conectar seu Projeto ao GitHub

```bash
# Inicialize o git (se ainda não fez)
git init

# Adicione todos os arquivos
git add .

# Faça o commit inicial
git commit -m "Initial commit: GvG Strategy Planner"

# Renomeie a branch para main
git branch -M main

# Adicione o remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/NGL-wwm-gvg.git

# Envie para o GitHub
git push -u origin main
```

### Passo 3: Configurar GitHub Pages

1. Vá para as configurações do repositório no GitHub
2. No menu lateral, clique em **"Pages"**
3. Em **"Build and deployment"**:
   - **Source**: Selecione "Deploy from a branch"
   - **Branch**: Selecione "gh-pages" e "/ (root)"
4. Clique em "Save"

### Passo 4: Fazer o Deploy

Agora é só rodar um comando:

```bash
npm run deploy
```

Este comando vai:
1. Compilar o projeto (`npm run build`)
2. Fazer deploy da pasta `dist` para o GitHub Pages

**Importante**: Na primeira vez, pode demorar 2-3 minutos para o site ficar disponível.

### Passo 5: Acessar seu Site

Após o deploy, seu site estará disponível em:
```
https://SEU_USUARIO.github.io/NGL-wwm-gvg/
```

## Opção 2: Deploy Automático com GitHub Actions

Se preferir deploy automático toda vez que fizer push, use esta opção.

### Habilitar GitHub Actions

1. Vá para as configurações do repositório
2. Clique em **"Pages"** no menu lateral
3. Em **"Build and deployment"**:
   - **Source**: Selecione "GitHub Actions"

Pronto! O workflow em `.github/workflows/deploy.yml` vai fazer deploy automaticamente a cada push na branch `main`.

## Atualizando o Site

### Com Deploy Manual (npm)

Depois de fazer mudanças no código:

```bash
# Faça commit das suas mudanças
git add .
git commit -m "Descrição das mudanças"
git push

# Faça o deploy
npm run deploy
```

### Com Deploy Automático (GitHub Actions)

Basta fazer push:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

O GitHub Actions vai fazer o deploy automaticamente!

## Personalizando a URL

### Atualizar o homepage no package.json

Abra `package.json` e atualize a linha:
```json
"homepage": "https://SEU_USUARIO.github.io/NGL-wwm-gvg"
```

### Atualizar o base no vite.config.ts

O arquivo já está configurado corretamente:
```ts
base: '/NGL-wwm-gvg/'
```

Se mudar o nome do repositório, atualize para:
```ts
base: '/NOVO-NOME-REPO/'
```

## Troubleshooting

### Site mostra página 404 ou em branco

1. Verifique se o `base` no `vite.config.ts` corresponde ao nome do repositório:
   ```ts
   base: '/NGL-wwm-gvg/'
   ```

2. Certifique-se de que o GitHub Pages está habilitado nas configurações

3. Aguarde 2-3 minutos após o primeiro deploy

### Mudanças não aparecem

1. Aguarde alguns minutos (pode demorar até 5 minutos)
2. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
3. Verifique se o deploy foi bem-sucedido:
   - Deploy manual: veja o output do terminal
   - GitHub Actions: veja a aba "Actions" no repositório

### Erro ao fazer deploy

**Erro: "Failed to get remote.origin.url"**
- Certifique-se de que adicionou o remote do GitHub:
  ```bash
  git remote add origin https://github.com/SEU_USUARIO/NGL-wwm-gvg.git
  ```

**Erro: "Permission denied"**
- Configure suas credenciais do GitHub
- Ou use SSH ao invés de HTTPS

### Build falha

1. Teste o build localmente primeiro:
   ```bash
   npm run build
   ```
2. Corrija os erros que aparecerem
3. Faça commit e deploy novamente

## Comparação: Deploy Manual vs Automático

### Deploy Manual (npm run deploy)
**Vantagens:**
- ✅ Mais simples de configurar
- ✅ Você controla quando fazer deploy
- ✅ Não usa minutos do GitHub Actions

**Desvantagens:**
- ❌ Precisa rodar o comando manualmente
- ❌ Dois passos: push + deploy

### Deploy Automático (GitHub Actions)
**Vantagens:**
- ✅ Deploy automático a cada push
- ✅ Um único passo (apenas push)
- ✅ Histórico visual dos deploys

**Desvantagens:**
- ❌ Usa minutos do GitHub Actions (mas é gratuito para repos públicos)
- ❌ Deploy mesmo em mudanças pequenas

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build localmente
npm run preview

# Deploy manual para GitHub Pages
npm run deploy

# Ver status do git
git status

# Ver branches
git branch

# Ver remote
git remote -v
```

## Estrutura do Projeto

```
NGL-wwm-gvg/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow do GitHub Actions
├── dist/                       # Build output (gerado automaticamente)
├── src/                        # Código fonte
├── public/                     # Arquivos estáticos
├── vite.config.ts             # Configuração do Vite (inclui base path)
├── package.json               # Scripts e dependências
└── DEPLOY.md                  # Este arquivo
```

## Suporte

Para problemas com:
- **GitHub Pages**: [Documentação oficial](https://docs.github.com/en/pages)
- **gh-pages**: [Repositório do pacote](https://github.com/tschaub/gh-pages)
- **Vite**: [Guia de deploy estático](https://vitejs.dev/guide/static-deploy.html)

## Próximos Passos

Após fazer o deploy com sucesso:

1. ✅ Atualize o README.md com a URL do seu site
2. ✅ Compartilhe com sua guild
3. ✅ Configure um domínio customizado (opcional)
4. ✅ Adicione o link no seu perfil do GitHub

---

**Dica**: Sempre teste localmente com `npm run build && npm run preview` antes de fazer deploy!

# 🚀 Deploy Rápido - 3 Passos

## 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e crie um novo repositório
2. Nome: `NGL-wwm-gvg`
3. Público
4. NÃO inicialize com arquivos

## 2️⃣ Conectar ao GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NGL-wwm-gvg.git
git push -u origin main
```

## 3️⃣ Fazer Deploy

```bash
npm run deploy
```

## ✅ Pronto!

Seu site estará disponível em:
```
https://SEU_USUARIO.github.io/NGL-wwm-gvg/
```

## 📝 Configurar GitHub Pages (Primeira Vez)

Depois do primeiro `npm run deploy`:

1. Vá em **Settings** > **Pages** no GitHub
2. Em **Source**, selecione: **Deploy from a branch**
3. Em **Branch**, selecione: **gh-pages** / **(root)**
4. Clique em **Save**

Aguarde 2-3 minutos e acesse a URL acima!

## 🔄 Atualizar o Site

Depois de fazer mudanças:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
npm run deploy
```

---

Para instruções detalhadas, veja [DEPLOY.md](DEPLOY.md)

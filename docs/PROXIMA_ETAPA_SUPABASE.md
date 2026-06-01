# Próxima etapa no Supabase

## 1. Criar conta no Supabase
Acesse o site do Supabase e crie um projeto gratuito.

## 2. Rodar SQL
Copie o conteúdo de `supabase/schema_producao.sql` e rode no SQL Editor.

## 3. Criar bucket
Storage > New bucket:
- nome: supplier-media
- public: yes

## 4. Copiar chaves
Project Settings > API:
- Project URL
- anon public key

Colar em `.env.local`.

## 5. Testar fluxo
- cadastro fornecedor
- editar vitrine
- upload foto
- plano simulado
- lead/chat

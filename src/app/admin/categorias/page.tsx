'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Cake,
  Camera,
  CheckCircle2,
  Edit,
  Flower2,
  Gem,
  Landmark,
  Loader2,
  Music2,
  Plus,
  Search,
  Settings,
  Trash2,
  Utensils,
  Video,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  suppliers_count: number;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryIcon(name: string) {
  const normalized = String(name || '').toLowerCase();

  if (
    normalized.includes('fotografia') ||
    normalized.includes('filmagem') ||
    normalized.includes('foto')
  ) {
    return Camera;
  }

  if (normalized.includes('buffet')) {
    return Utensils;
  }

  if (
    normalized.includes('ornamentação') ||
    normalized.includes('ornamentacao') ||
    normalized.includes('decoração') ||
    normalized.includes('decoracao')
  ) {
    return Flower2;
  }

  if (
    normalized.includes('cabine') ||
    normalized.includes('totem')
  ) {
    return Video;
  }

  if (
    normalized.includes('cerimonial') ||
    normalized.includes('assessoria')
  ) {
    return Gem;
  }

  if (
    normalized.includes('música') ||
    normalized.includes('musica') ||
    normalized.includes('banda')
  ) {
    return Music2;
  }

  if (
    normalized.includes('bolo') ||
    normalized.includes('doce')
  ) {
    return Cake;
  }

  if (
    normalized.includes('espaço') ||
    normalized.includes('espaco') ||
    normalized.includes('salão') ||
    normalized.includes('salao')
  ) {
    return Landmark;
  }

  return Settings;
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadCategories() {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data: categoryData, error: categoryError } =
        await supabase
          .from('categories')
          .select('id,name,slug')
          .order('name', { ascending: true });

      if (categoryError) {
        throw categoryError;
      }

      const { data: supplierData, error: supplierError } =
        await supabase
          .from('suppliers')
          .select('category_id');

      if (supplierError) {
        console.error(
          'Erro ao contar fornecedores por categoria:',
          supplierError
        );
      }

      const counts = (supplierData || []).reduce(
        (acc: Record<string, number>, item: any) => {
          if (item.category_id) {
            acc[item.category_id] =
              (acc[item.category_id] || 0) + 1;
          }

          return acc;
        },
        {}
      );

      const rows: CategoryRow[] = (categoryData || []).map(
        (item: any) => ({
          id: item.id,
          name: item.name || 'Categoria sem nome',
          slug: item.slug || '',
          suppliers_count: counts[item.id] || 0,
        })
      );

      setCategories(rows);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);

      setErrorMessage(
        error?.message ||
          'Não foi possível carregar as categorias.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalized)
    );
  }, [categories, search]);

  const totalSuppliers = categories.reduce(
    (total, category) =>
      total + category.suppliers_count,
    0
  );

  async function handleCreateCategory(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = newCategoryName.trim();

    if (!cleanName) {
      setErrorMessage('Informe o nome da categoria.');
      return;
    }

    const slug = normalizeSlug(cleanName);

    if (!slug) {
      setErrorMessage(
        'Não foi possível gerar o identificador da categoria.'
      );
      return;
    }

    try {
      setSaving(true);

      const { data: existingCategory, error: existingError } =
        await supabase
          .from('categories')
          .select('id')
          .or(
            `name.ilike.${cleanName},slug.eq.${slug}`
          )
          .limit(1)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingCategory?.id) {
        setErrorMessage(
          'Já existe uma categoria com esse nome.'
        );
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          name: cleanName,
          slug,
        });

      if (error) {
        throw error;
      }

      setNewCategoryName('');
      setShowNewCategory(false);
      setSuccessMessage(
        'Categoria criada com sucesso.'
      );

      await loadCategories();
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);

      const message = String(error?.message || '');

      if (
        message.includes('duplicate key') ||
        message.includes('already exists')
      ) {
        setErrorMessage(
          'Já existe uma categoria com esse nome.'
        );
        return;
      }

      if (
        message.toLowerCase().includes('row-level security')
      ) {
        setErrorMessage(
          'A conta não tem permissão para criar categorias. Verifique a política de administrador no Supabase.'
        );
        return;
      }

      setErrorMessage(
        message ||
          'Não foi possível criar a categoria.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3a925] text-white shadow-lg">
                <Settings size={31} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#e3a925]">
                  Administração
                </p>

                <h1 className="font-serif text-[34px] leading-tight">
                  Categorias
                </h1>

                <p className="mt-1 text-sm text-white/70">
                  Gerencie os tipos de serviços do app.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] bg-white p-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#f7f2ea] px-4 py-4">
                <Search
                  size={25}
                  className="text-[#d99200]"
                />

                <input
                  className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
                  placeholder="Buscar categoria..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 px-6 pt-6">
          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-[#d99200]">
              {categories.length}
            </p>

            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Categorias
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-green-600">
              {categories.length}
            </p>

            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Ativas
            </p>
          </div>

          <div className="rounded-[22px] bg-white p-4 text-center shadow-sm ring-1 ring-[#f1e7cf]">
            <p className="text-2xl font-extrabold text-blue-600">
              {totalSuppliers}
            </p>

            <p className="mt-1 text-[11px] font-bold text-gray-600">
              Fornecedores
            </p>
          </div>
        </section>

        <section className="px-6 pt-6">
          <button
            type="button"
            onClick={() => {
              setShowNewCategory(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#e3a925] py-4 text-center font-extrabold text-white shadow-lg"
          >
            <Plus size={21} />
            Nova categoria
          </button>
        </section>

        {(errorMessage || successMessage) && (
          <section className="px-6 pt-4">
            {errorMessage && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <CheckCircle2 size={18} />
                {successMessage}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">
              Lista de categorias
            </h2>

            <span className="text-xs font-bold text-gray-500">
              {filteredCategories.length} exibidas
            </span>
          </div>

          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#d99200]"
              />

              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando categorias...
              </p>
            </div>
          )}

          {!loading &&
            filteredCategories.length === 0 && (
              <div className="rounded-[28px] bg-white p-6 text-center text-sm font-bold text-gray-500 shadow-sm ring-1 ring-[#f1e7cf]">
                Nenhuma categoria encontrada.
              </div>
            )}

          {!loading && (
            <div className="space-y-4">
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(
                  category.name
                );

                return (
                  <div
                    key={category.id}
                    className="rounded-[28px] bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,.08)] ring-1 ring-[#f1e7cf]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                        <Icon size={30} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-extrabold">
                              {category.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {category.suppliers_count}{' '}
                              fornecedores cadastrados
                            </p>
                          </div>

                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-extrabold text-green-700">
                            <CheckCircle2 size={13} />
                            Ativa
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            disabled
                            title="Edição será habilitada em uma próxima etapa"
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fbf7f1] px-4 py-2 text-xs font-extrabold text-gray-400 ring-1 ring-[#f1e7cf]"
                          >
                            <Edit size={15} />
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled
                            title="Destaque de categoria ainda não configurado"
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-xs font-extrabold text-gray-500"
                          >
                            Destacar
                          </button>

                          <button
                            type="button"
                            disabled
                            title="Exclusão desativada para evitar remover categorias em uso"
                            className="rounded-full bg-red-50 px-4 py-2 text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {showNewCategory && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-4 pb-5">
            <form
              onSubmit={handleCreateCategory}
              className="w-full max-w-[430px] rounded-[30px] bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d99200]">
                    Administração
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    Nova categoria
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                    }
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white"
                >
                  <X size={21} />
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-extrabold">
                  Nome da categoria
                </span>

                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(event) =>
                    setNewCategoryName(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Iluminação e Sonorização"
                  className="mt-2 w-full rounded-[20px] border border-[#f1e7cf] bg-[#fbf7f1] p-4 text-sm font-medium outline-none"
                />
              </label>

              <p className="mt-3 text-xs font-bold leading-5 text-gray-500">
                O identificador interno será criado automaticamente.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#e3a925] py-4 font-extrabold text-white shadow-lg disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={20} />
                )}

                {saving
                  ? 'Criando categoria...'
                  : 'Criar categoria'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

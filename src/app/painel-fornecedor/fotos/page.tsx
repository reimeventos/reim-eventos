'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ImageIcon,
  Upload,
  Video,
  Camera,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STORAGE_BUCKET = 'supplier-media';

function isVideoUrl(url: string) {
  const normalized = String(url || '').toLowerCase();

  return (
    normalized.includes('.mp4') ||
    normalized.includes('.webm') ||
    normalized.includes('.mov') ||
    normalized.includes('video')
  );
}

function getFileKind(file: File) {
  if (file.type.startsWith('video/')) return 'video';
  return 'image';
}

function cleanFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export default function FotosFornecedorPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [supplier, setSupplier] = useState<any>(null);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [settingCoverId, setSettingCoverId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setErrorMessage('Faça login como fornecedor para gerenciar suas mídias.');
        setSupplier(null);
        setMedias([]);
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id,business_name,status,owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (supplierError) throw supplierError;

      if (!supplierData?.id) {
        setErrorMessage('Perfil de fornecedor não encontrado para esta conta.');
        setSupplier(null);
        setMedias([]);
        return;
      }

      setSupplier(supplierData);

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('id,supplier_id,file_url,is_cover,created_at')
        .eq('supplier_id', supplierData.id)
        .order('is_cover', { ascending: false })
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;

      setMedias(mediaData || []);
    } catch (error: any) {
      console.error('Erro ao carregar mídias:', error);
      setErrorMessage(
        error?.message || 'Não foi possível carregar as mídias da vitrine.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(fileList: FileList | null) {
    setErrorMessage('');
    setSuccessMessage('');

    const file = fileList?.[0];

    if (!file) return;

    if (!supplier?.id) {
      setErrorMessage('Perfil de fornecedor não carregado.');
      return;
    }

    const kind = getFileKind(file);
    const maxSize = kind === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (kind === 'image' && !allowedImages.includes(file.type)) {
      setErrorMessage('Envie fotos em JPG, PNG ou WEBP.');
      return;
    }

    if (kind === 'video' && !allowedVideos.includes(file.type)) {
      setErrorMessage('Envie vídeos em MP4, WEBM ou MOV.');
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage(
        kind === 'video'
          ? 'O vídeo deve ter no máximo 50MB.'
          : 'A foto deve ter no máximo 5MB.'
      );
      return;
    }

    try {
      setUploading(true);

      const safeName = cleanFileName(file.name);
      const filePath = `${supplier.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const fileUrl = publicData.publicUrl;

      const { error: insertError } = await supabase.from('media').insert({
        supplier_id: supplier.id,
        owner_id: supplier.owner_id,
        file_url: fileUrl,
        type: kind,
        is_cover: medias.length === 0,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccessMessage(
        kind === 'video'
          ? 'Vídeo enviado com sucesso.'
          : 'Foto enviada com sucesso.'
      );

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      await loadData();
    } catch (error: any) {
      console.error('Erro ao enviar mídia:', error);

      setErrorMessage(
        error?.message ||
          'Não foi possível enviar a mídia. Verifique o bucket supplier-media no Supabase Storage.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSetCover(mediaId: string) {
    if (!supplier?.id) return;

    try {
      setSettingCoverId(mediaId);
      setErrorMessage('');
      setSuccessMessage('');

      const { error: clearError } = await supabase
        .from('media')
        .update({ is_cover: false })
        .eq('supplier_id', supplier.id);

      if (clearError) throw clearError;

      const { error: coverError } = await supabase
        .from('media')
        .update({ is_cover: true })
        .eq('id', mediaId)
        .eq('supplier_id', supplier.id);

      if (coverError) throw coverError;

      setSuccessMessage('Foto de capa atualizada.');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao definir capa:', error);
      setErrorMessage(error?.message || 'Não foi possível definir a foto de capa.');
    } finally {
      setSettingCoverId('');
    }
  }

  async function handleRemoveMedia(media: any) {
    const confirmed = window.confirm('Deseja remover esta mídia da vitrine?');

    if (!confirmed) return;

    try {
      setRemovingId(media.id);
      setErrorMessage('');
      setSuccessMessage('');

      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', media.id)
        .eq('supplier_id', supplier.id);

      if (error) throw error;

      setSuccessMessage('Mídia removida da vitrine.');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao remover mídia:', error);
      setErrorMessage(error?.message || 'Não foi possível remover esta mídia.');
    } finally {
      setRemovingId('');
    }
  }

  const photoCount = medias.filter((item) => !isVideoUrl(item.file_url)).length;
  const videoCount = medias.filter((item) => isVideoUrl(item.file_url)).length;
  const coverMedia = medias.find((item) => item.is_cover);

  return (
    <main className="min-h-screen bg-black text-[#151515]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fbf7f1] pb-10 shadow-2xl">
        <section className="relative overflow-hidden rounded-b-[34px] bg-black px-6 pb-8 pt-7 text-white">
          <div className="absolute inset-0 bg-[url('/layout01-fundo.png')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black" />

          <div className="relative z-10">
            <Link
              href="/painel-fornecedor"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e3a925]"
            >
              <ArrowLeft size={17} />
              Voltar
            </Link>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e3a925]">
                Vitrine do fornecedor
              </p>

              <h1 className="mt-2 font-serif text-[34px] leading-tight">
                Mídias da vitrine
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Envie fotos e vídeos para valorizar sua vitrine.
              </p>
            </div>

            {supplier && (
              <div className="mt-6 rounded-[28px] bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/60">Fornecedor</p>
                <h2 className="mt-1 line-clamp-1 text-xl font-extrabold">
                  {supplier.business_name || 'Minha vitrine'}
                </h2>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <ImageIcon size={16} className="mx-auto text-[#e3a925]" />
                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Fotos
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold">
                      {photoCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Video size={16} className="mx-auto text-[#e3a925]" />
                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Vídeos
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold">
                      {videoCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/25 p-3 text-center">
                    <Star size={16} className="mx-auto text-[#e3a925]" />
                    <p className="mt-1 text-[10px] font-bold text-white/50">
                      Capa
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold">
                      {coverMedia ? 'OK' : 'N/I'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pt-6">
          {loading && (
            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
              <Loader2 size={36} className="mx-auto animate-spin text-[#d99200]" />
              <p className="mt-3 text-sm font-bold text-gray-500">
                Carregando mídias...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="mb-4 rounded-[22px] bg-red-50 p-4 text-sm font-bold leading-5 text-red-700 ring-1 ring-red-100">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {!loading && successMessage && (
            <div className="mb-4 rounded-[22px] bg-green-50 p-4 text-sm font-bold leading-5 text-green-700 ring-1 ring-green-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {!loading && supplier && (
            <>
              <div className="rounded-[28px] border-2 border-dashed border-[#e3a925]/60 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7e8] text-[#d99200]">
                  {uploading ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : (
                    <Upload size={32} />
                  )}
                </div>

                <h2 className="mt-4 text-lg font-extrabold">
                  Enviar nova mídia
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                  Fotos em JPG, PNG ou WEBP até 5MB.
                  <br />
                  Vídeos em MP4, WEBM ou MOV até 50MB.
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(event) => handleUpload(event.target.files)}
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="mt-5 rounded-[22px] bg-[#e3a925] px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60"
                >
                  {uploading ? 'Enviando...' : 'Selecionar arquivo'}
                </button>
              </div>

              <section className="grid grid-cols-2 gap-4 pt-6">
                <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <ImageIcon size={29} />
                  </div>
                  <h3 className="mt-3 text-sm font-extrabold">Fotos</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {photoCount} na galeria
                  </p>
                </div>

                <div className="rounded-[24px] bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d99200]">
                    <Video size={29} />
                  </div>
                  <h3 className="mt-3 text-sm font-extrabold">Vídeos</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {videoCount} no portfólio
                  </p>
                </div>
              </section>

              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold">Galeria da vitrine</h2>
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      {medias.length} mídia(s) cadastrada(s)
                    </p>
                  </div>

                  <Link
                    href={`/fornecedor/${supplier.id}`}
                    className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b97900]"
                  >
                    Ver vitrine
                  </Link>
                </div>

                {medias.length === 0 && (
                  <div className="rounded-[28px] bg-white p-6 text-center shadow-sm ring-1 ring-[#f1e7cf]">
                    <Camera size={38} className="mx-auto text-[#d99200]" />

                    <h3 className="mt-4 text-lg font-extrabold">
                      Nenhuma mídia enviada
                    </h3>

                    <p className="mt-2 text-sm leading-5 text-gray-500">
                      A primeira foto enviada será usada como capa da vitrine.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {medias.map((item) => {
                    const isVideo = isVideoUrl(item.file_url);
                    const isCover = item.is_cover;

                    return (
                      <div
                        key={item.id}
                        className={
                          isCover
                            ? 'overflow-hidden rounded-[24px] bg-white shadow-sm ring-2 ring-[#e3a925]'
                            : 'overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-[#f1e7cf]'
                        }
                      >
                        <div className="relative h-40 bg-[#151515]">
                          {isVideo ? (
                            <video
                              src={item.file_url}
                              className="h-full w-full object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={item.file_url}
                              alt="Mídia da vitrine"
                              className="h-full w-full object-cover"
                            />
                          )}

                          {isCover && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#e3a925] px-3 py-1 text-[10px] font-extrabold text-white">
                              Capa
                            </span>
                          )}

                          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-extrabold text-white">
                            {isVideo ? 'Vídeo' : 'Foto'}
                          </span>
                        </div>

                        <div className="space-y-2 p-3">
                          {!isVideo && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(item.id)}
                              disabled={settingCoverId === item.id || isCover}
                              className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#fbf7f1] py-2 text-xs font-extrabold text-[#151515] ring-1 ring-[#f1e7cf] disabled:opacity-60"
                            >
                              <Star size={14} className="text-[#d99200]" />
                              {settingCoverId === item.id
                                ? 'Salvando...'
                                : isCover
                                  ? 'Foto de capa'
                                  : 'Definir capa'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(item)}
                            disabled={removingId === item.id}
                            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-white py-2 text-xs font-extrabold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {removingId === item.id ? 'Removendo...' : 'Remover'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

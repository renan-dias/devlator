"use client";
import Image from "next/image";
import { useState } from "react";
import { FaFileAlt, FaGlobe, FaImage, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import Modal, { useModal } from "./Modal";

export interface ChatExtras {
  regional?: { city: string; state: string };
  site?: { url: string; content: string };
  docs?: Array<{ name: string; text?: string }>;
  figmaImage?: string;
}

interface Props {
  extras: ChatExtras;
  onChange: (extras: ChatExtras) => void;
  onError: (message: string) => void;
}

const MAX_DOC_CHARS = 12000;

/** Reduz a imagem para no máx. 1600px e JPEG, para caber no limite da API. */
function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Imagem inválida"));
    img.src = url;
  });
}

export default function ChatContextSelector({ extras, onChange, onError }: Props) {
  const figma = useModal();
  const site = useModal();
  const doc = useModal();
  const [siteUrl, setSiteUrl] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const remove = (key: keyof ChatExtras) => {
    const next = { ...extras };
    delete next[key];
    onChange(next);
  };

  const addRegional = async () => {
    setLoading("regional");
    try {
      const res = await fetch("/api/location");
      const data = await res.json();
      onChange({ ...extras, regional: { city: data.city, state: data.state } });
    } catch {
      onError("Não consegui identificar sua localização.");
    } finally {
      setLoading(null);
    }
  };

  const submitSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl.trim()) return;
    setLoading("site");
    try {
      const res = await fetch("/api/webscrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Falha ao analisar");
      onChange({ ...extras, site: { url: result.data.url, content: result.data.content } });
      setSiteUrl("");
      site.closeModal();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao analisar o site.");
    } finally {
      setLoading(null);
    }
  };

  const pickImage = async (file?: File) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      setPreview(await downscaleImage(file));
    } catch {
      onError("Não consegui ler essa imagem.");
    }
  };

  const pickDocs = async (files: FileList | null) => {
    if (!files?.length) return;
    const docs = await Promise.all(
      Array.from(files).map(async (f) => ({
        name: f.name,
        text: /\.(txt|md|markdown|csv|json)$/i.test(f.name) ? (await f.text()).slice(0, MAX_DOC_CHARS) : undefined,
      })),
    );
    onChange({ ...extras, docs });
    doc.closeModal();
  };

  const OPTIONS = [
    { key: "figmaImage" as const, label: "Imagem do design", icon: FaImage, active: !!extras.figmaImage, onAdd: figma.openModal, detail: "imagem anexada" },
    { key: "site" as const, label: "Site de referência", icon: FaGlobe, active: !!extras.site, onAdd: site.openModal, detail: extras.site?.url },
    { key: "docs" as const, label: "Requisitos", icon: FaFileAlt, active: !!extras.docs?.length, onAdd: doc.openModal, detail: `${extras.docs?.length ?? 0} arquivo(s)` },
    { key: "regional" as const, label: "Minha região", icon: FaMapMarkerAlt, active: !!extras.regional, onAdd: addRegional, detail: extras.regional && `${extras.regional.city}, ${extras.regional.state}` },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2" aria-label="Contexto adicional">
        {OPTIONS.map(({ key, label, icon: Icon, active, onAdd, detail }) =>
          active ? (
            <span key={key} className="chip !border-purple/50 !bg-purple/10 !text-fg">
              <Icon className="text-purple" aria-hidden />
              <span className="max-w-[160px] truncate">{detail}</span>
              <button onClick={() => remove(key)} aria-label={`Remover ${label}`} className="ml-1 text-subtle hover:text-red">
                <FaTimes aria-hidden />
              </button>
            </span>
          ) : (
            <button key={key} type="button" onClick={onAdd} disabled={loading === key} className="chip hover:border-purple/50 hover:text-fg">
              <Icon aria-hidden /> {loading === key ? "Carregando…" : `+ ${label}`}
            </button>
          ),
        )}
      </div>

      <Modal isOpen={figma.isOpen} onClose={figma.closeModal} title="Enviar imagem do design">
        <div className="space-y-4">
          <p className="text-sm text-muted">Envie um print do Figma ou do layout. O Devinho avalia telas, componentes e complexidade visual.</p>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-purple/60">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
            {preview ? (
              <>
                <Image src={preview} alt="Pré-visualização do design" width={320} height={200} unoptimized className="max-h-48 w-auto rounded-lg object-contain" />
                <span className="text-sm text-green">Imagem pronta. Clique para trocar.</span>
              </>
            ) : (
              <>
                <FaImage className="text-3xl text-subtle" aria-hidden />
                <span>Selecionar imagem</span>
                <span className="text-xs text-subtle">PNG, JPG ou WebP</span>
              </>
            )}
          </label>
          <button
            className="btn-primary w-full"
            disabled={!preview}
            onClick={() => {
              onChange({ ...extras, figmaImage: preview! });
              setPreview(null);
              figma.closeModal();
            }}
          >
            Anexar à conversa
          </button>
        </div>
      </Modal>

      <Modal isOpen={site.isOpen} onClose={site.closeModal} title="Site de referência">
        <form onSubmit={submitSite} className="space-y-4">
          <p className="text-sm text-muted">Cole o endereço de um site parecido com o que você vai construir. Extraímos estrutura, seções e tecnologias.</p>
          <div>
            <label htmlFor="site-url" className="label">URL</label>
            <input id="site-url" type="text" inputMode="url" className="input" placeholder="exemplo.com.br" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={!siteUrl.trim() || loading === "site"}>
            {loading === "site" ? "Analisando…" : "Analisar site"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={doc.isOpen} onClose={doc.closeModal} title="Documentos de requisitos">
        <div className="space-y-4">
          <p className="text-sm text-muted">Arquivos .txt, .md, .csv e .json têm o conteúdo lido (até 12 mil caracteres). Para PDF/DOCX, só o nome é enviado — cole trechos no chat.</p>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-purple/60">
            <input type="file" multiple accept=".txt,.md,.markdown,.csv,.json,.pdf,.doc,.docx" className="sr-only" onChange={(e) => pickDocs(e.target.files)} />
            <FaFileAlt className="text-3xl text-subtle" aria-hidden />
            <span>Selecionar arquivos</span>
          </label>
        </div>
      </Modal>
    </>
  );
}

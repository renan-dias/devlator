'use client';
import React, { useState } from "react";
import { FaImage, FaGlobe, FaFileAlt, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import Modal, { useModal } from "./Modal";

export type ChatContextOption = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactElement;
  needsModal?: boolean;
};

export const CONTEXT_OPTIONS: ChatContextOption[] = [
  { 
    label: "Captura do Figma", 
    value: "figma", 
    description: "Envie uma imagem do seu design para análise",
    icon: <FaImage className="text-[#ff79c6]" />,
    needsModal: true
  },
  { 
    label: "Site de exemplo", 
    value: "site", 
    description: "Analise um site de referência para comparação",
    icon: <FaGlobe className="text-[#8be9fd]" />,
    needsModal: true
  },
  { 
    label: "Documentação", 
    value: "doc", 
    description: "Envie documentos ou PDFs para análise",
    icon: <FaFileAlt className="text-[#f1fa8c]" />,
    needsModal: true
  },
  { 
    label: "Contexto regional", 
    value: "regional", 
    description: "Use sua localização para ajustar preços regionais",
    icon: <FaMapMarkerAlt className="text-[#50fa7b]" />,
    needsModal: false
  },
];

interface ChatContextSelectorProps {
  selected: string[];
  onChange: (values: string[]) => void;
  onContextData?: (type: string, data: any) => void;
}

export default function ChatContextSelector({ selected, onChange, onContextData }: ChatContextSelectorProps) {
  const { isOpen: isFigmaOpen, openModal: openFigma, closeModal: closeFigma } = useModal();
  const { isOpen: isSiteOpen, openModal: openSite, closeModal: closeSite } = useModal();
  const { isOpen: isDocOpen, openModal: openDoc, closeModal: closeDoc } = useModal();
  
  const [siteUrl, setSiteUrl] = useState('');
  const [isLoadingSite, setIsLoadingSite] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const toggle = async (value: string) => {
    const option = CONTEXT_OPTIONS.find(opt => opt.value === value);
    
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
      return;
    }

    if (option?.needsModal) {
      switch (value) {
        case 'figma':
          openFigma();
          break;
        case 'site':
          openSite();
          break;
        case 'doc':
          openDoc();
          break;
      }
    } else {
      if (value === 'regional') {
        await handleRegionalContext();
      }
      onChange([...selected, value]);
    }
  };

  const handleRegionalContext = async () => {
    try {
      const response = await fetch('/api/location');
      const locationData = await response.json();
      onContextData?.('regional', locationData);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSiteSubmit = async () => {
    if (!siteUrl.trim()) return;
    
    setIsLoadingSite(true);
    try {
      const response = await fetch('/api/webscrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: siteUrl })
      });

      const result = await response.json();
      
      if (result.success) {
        onContextData?.('site', { 
          url: siteUrl,
          content: result.data.content || '',
          analysis: result.data.analysis || 'Site analisado com sucesso'
        });
        onChange([...selected, 'site']);
        closeSite();
        setSiteUrl('');
      } else {
        onContextData?.('error', { message: `Erro: ${result.error}` });
      }
    } catch (error) {
      onContextData?.('error', { message: 'Erro ao analisar o site. Verifique a URL e tente novamente.' });
    } finally {
      setIsLoadingSite(false);
    }
  };

  const handleFigmaSubmit = () => {
    if (imagePreview) {
      onContextData?.('figma', { image: imagePreview });
      onChange([...selected, 'figma']);
      closeFigma();
      setImagePreview(null);
    }
  };

  const handleDocSubmit = () => {
    if (selectedFiles.length > 0) {
      onContextData?.('doc', { files: selectedFiles });
      onChange([...selected, 'doc']);
      closeDoc();
      setSelectedFiles([]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4">
        {CONTEXT_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs transition-all ${
                isSelected 
                  ? "bg-[#bd93f9]/20 border-[#bd93f9] text-[#bd93f9]" 
                  : "bg-[#44475a] border-[#6272a4] text-[#f8f8f2] hover:bg-[#6272a4] hover:border-[#bd93f9]"
              }`}
              title={opt.description}
              onClick={() => toggle(opt.value)}
            >
              <div className="text-lg">{opt.icon}</div>
              <span className="font-medium">{opt.label}</span>
              {opt.needsModal && !isSelected && (
                <FaPlus className="text-xs opacity-50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Modal Figma */}
      <Modal isOpen={isFigmaOpen} onClose={closeFigma} title="Enviar Captura do Figma">
        <div className="space-y-4">
          <p className="text-[#f8f8f2] text-sm">
            Envie uma imagem da sua tela do Figma para que o Devinho possa analisar o design e dar sugestões mais precisas.
          </p>
          
          <div className="border-2 border-dashed border-[#6272a4] rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="figma-upload"
            />
            <label htmlFor="figma-upload" className="cursor-pointer">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-[#50fa7b] text-sm">Imagem carregada! Clique para trocar.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FaImage className="text-3xl text-[#6272a4] mx-auto" />
                  <p className="text-[#f8f8f2]">Clique para selecionar uma imagem</p>
                  <p className="text-[#6272a4] text-xs">PNG, JPG ou WebP</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeFigma}
              className="flex-1 px-4 py-2 bg-[#6272a4] text-[#f8f8f2] rounded-lg hover:bg-[#44475a] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleFigmaSubmit}
              disabled={!imagePreview}
              className="flex-1 px-4 py-2 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Site */}
      <Modal isOpen={isSiteOpen} onClose={closeSite} title="Analisar Site de Exemplo">
        <div className="space-y-4">
          <p className="text-[#f8f8f2] text-sm">
            Cole a URL de um site que você gostaria de usar como referência. Vamos analisar o conteúdo para ajudar na precificação.
          </p>
          
          <div className="space-y-2">
            <label className="block text-[#f1fa8c] text-sm font-medium">URL do Site:</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full px-3 py-2 bg-[#282a36] border border-[#44475a] rounded-lg text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeSite}
              className="flex-1 px-4 py-2 bg-[#6272a4] text-[#f8f8f2] rounded-lg hover:bg-[#44475a] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSiteSubmit}
              disabled={!siteUrl.trim() || isLoadingSite}
              className="flex-1 px-4 py-2 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingSite ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Documentação */}
      <Modal isOpen={isDocOpen} onClose={closeDoc} title="Enviar Documentação">
        <div className="space-y-4">
          <p className="text-[#f8f8f2] text-sm">
            Envie documentos, PDFs ou arquivos de texto que possam ajudar na análise do projeto.
          </p>
          
          <div className="border-2 border-dashed border-[#6272a4] rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              className="hidden"
              id="doc-upload"
            />
            <label htmlFor="doc-upload" className="cursor-pointer">
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <FaFileAlt className="text-3xl text-[#50fa7b] mx-auto" />
                  <p className="text-[#50fa7b] text-sm">
                    {selectedFiles.length} arquivo(s) selecionado(s)
                  </p>
                  <div className="text-xs text-[#f8f8f2]">
                    {selectedFiles.map(file => file.name).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <FaFileAlt className="text-3xl text-[#6272a4] mx-auto" />
                  <p className="text-[#f8f8f2]">Clique para selecionar documentos</p>
                  <p className="text-[#6272a4] text-xs">PDF, DOC, TXT ou MD</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeDoc}
              className="flex-1 px-4 py-2 bg-[#6272a4] text-[#f8f8f2] rounded-lg hover:bg-[#44475a] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDocSubmit}
              disabled={selectedFiles.length === 0}
              className="flex-1 px-4 py-2 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
